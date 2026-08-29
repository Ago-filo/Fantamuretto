import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args=process.argv.slice(2),dryRun=args.includes("--dry-run"),sourceArg=args.find(arg=>arg!=="--dry-run");
if(!sourceArg){console.error("Uso: node scripts/import-fantapazz-list.mjs <listone.csv> [--dry-run]");process.exit(1)}

const sourcePath=path.resolve(sourceArg),outputPath=path.resolve("data/players.json");
const normalizeName=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const playerId=name=>`player:${normalizeName(name)}`;
const nameTokens=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);
const aliasCore=value=>{const tokens=nameTokens(value);while(tokens.length>1&&tokens.at(-1).length<=3)tokens.pop();return tokens.join("")};
const editDistance=(a,b)=>{const row=Array.from({length:b.length+1},(_,index)=>index);for(let i=1;i<=a.length;i++){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const saved=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));previous=saved}}return row[b.length]};

function parseDelimited(text,delimiter=";"){
 const rows=[];let row=[],field="",quoted=false;
 for(let index=0;index<text.length;index++){
  const char=text[index],next=text[index+1];
  if(char==='"'&&quoted&&next==='"'){field+='"';index++;continue}
  if(char==='"'){quoted=!quoted;continue}
  if(char===delimiter&&!quoted){row.push(field);field="";continue}
  if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')index++;row.push(field);field="";if(row.some(value=>value!==""))rows.push(row);row=[];continue}
  field+=char
 }
 if(field||row.length){row.push(field);rows.push(row)}
 const headers=rows.shift().map(value=>value.replace(/^\uFEFF/,"").trim());return rows.map(values=>Object.fromEntries(headers.map((header,index)=>[header,String(values[index]??"").trim()])))
}

const csv=parseDelimited(await fs.readFile(sourcePath,"utf8")),current=JSON.parse(await fs.readFile(outputPath,"utf8")),currentById=new Map(current.map(player=>[player.id||playerId(player.name),player]));
const activeRows=csv.filter(row=>row.Squadra),departedRows=csv.filter(row=>!row.Squadra),seen=new Set(),collisions=[];
for(const row of activeRows){const id=playerId(row.Calciatore);if(seen.has(id))collisions.push(`${row.Calciatore} (${id})`);seen.add(id)}
if(collisions.length)throw new Error(`Identificatori duplicati nel CSV: ${collisions.join(", ")}`);

const matchedByRowId=new Map(),usedCurrentIds=new Set(),aliasMatches=[];
for(const row of activeRows){const rowId=playerId(row.Calciatore),existing=currentById.get(rowId);if(existing){matchedByRowId.set(rowId,existing);usedCurrentIds.add(existing.id)}}
const matchUnique=(rowPredicate,currentPredicate,reason)=>{
 const rows=activeRows.filter(row=>!matchedByRowId.has(playerId(row.Calciatore))&&rowPredicate(row));for(const row of rows){const candidates=current.filter(player=>!usedCurrentIds.has(player.id)&&currentPredicate(player,row));if(candidates.length!==1)continue;const existing=candidates[0];matchedByRowId.set(playerId(row.Calciatore),existing);usedCurrentIds.add(existing.id);aliasMatches.push({from:existing.name,to:row.Calciatore,id:existing.id,reason})}
};
matchUnique(()=>true,(player,row)=>aliasCore(player.name)===aliasCore(row.Calciatore),"nome abbreviato");
matchUnique(()=>true,(player,row)=>{if(String(player.club||"").toLowerCase()!==row.Squadra.toLowerCase())return false;const a=aliasCore(player.name),b=aliasCore(row.Calciatore),shorter=a.length<b.length?a:b,longer=a.length<b.length?b:a;return shorter.length>=4&&longer.includes(shorter)},"nome esteso nello stesso club");
const remainingRows=activeRows.filter(row=>!matchedByRowId.has(playerId(row.Calciatore)));for(const row of remainingRows){const candidates=current.filter(player=>!usedCurrentIds.has(player.id)&&String(player.club||"").toLowerCase()===row.Squadra.toLowerCase()&&aliasCore(player.name)===aliasCore(row.Calciatore));if(candidates.length!==1)continue;const existing=candidates[0];matchedByRowId.set(playerId(row.Calciatore),existing);usedCurrentIds.add(existing.id);aliasMatches.push({from:existing.name,to:row.Calciatore,id:existing.id,reason:"ruolo aggiornato"})}
matchUnique(()=>true,(player,row)=>String(player.club||"").toLowerCase()===row.Squadra.toLowerCase()&&Math.min(aliasCore(player.name).length,aliasCore(row.Calciatore).length)>=5&&editDistance(aliasCore(player.name),aliasCore(row.Calciatore))===1,"refuso corretto nello stesso club");

const clubCounters=new Map(),preservedRoleDifferences=[],players=activeRows.map(row=>{
 const rowId=playerId(row.Calciatore),existing=matchedByRowId.get(rowId),id=existing?.id||rowId,quotation=Math.max(1,Math.round(Number(row.Quotazione)||1)),fvm=Math.max(1,Math.round(Number(existing?.fvm)||quotation)),teamNumber=(clubCounters.get(row.Squadra)||0)+1;clubCounters.set(row.Squadra,teamNumber);
 if(existing&&existing.role!==row.Ruolo)preservedRoleDifferences.push({name:row.Calciatore,kept:existing.role,csv:row.Ruolo});
 return{...(existing||{}),role:existing?.role||row.Ruolo,role_detail:existing?.role_detail||row.Ruolo,name:row.Calciatore,club:row.Squadra,fvm,fvm_prev:Number(existing?.fvm_prev)||fvm,quotation,quotation_prev:Number(existing?.quotation)||quotation,team_number:teamNumber,ocr_confidence:existing?.ocr_confidence??1,source_text:{fvm:String(fvm),quotation:`${quotation}(${Number(existing?.quotation)||quotation})`},manually_verified:existing?.manually_verified??false,previous_official:existing?{role:existing.role,club:existing.club,quotation:existing.quotation,fvm:existing.fvm}:undefined,id}
});

const nextIds=new Set(players.map(player=>player.id)),allCsvIds=new Set(csv.map(row=>playerId(row.Calciatore))),departedIds=new Set(departedRows.map(row=>playerId(row.Calciatore))),matched=players.filter(player=>currentById.has(player.id)).length,newPlayers=players.filter(player=>!currentById.has(player.id)),removed=current.filter(player=>!nextIds.has(player.id)),removedAsDeparted=removed.filter(player=>departedIds.has(player.id)),removedMissingFromCsv=removed.filter(player=>!allCsvIds.has(player.id));
console.log(JSON.stringify({source:sourcePath,csvRows:csv.length,serieAPlayers:players.length,excludedWithoutClub:departedRows.length,matched,newPlayers:newPlayers.length,aliasMatches:aliasMatches.length,preservedRoleDifferences:preservedRoleDifferences.length,removed:removed.length,removedAsDeparted:removedAsDeparted.length,removedMissingFromCsv:removedMissingFromCsv.length,newExamples:newPlayers.slice(0,12).map(player=>player.name),aliasExamples:aliasMatches.slice(0,20),preservedRoleExamples:preservedRoleDifferences.slice(0,25),departedExamples:removedAsDeparted.slice(0,12).map(player=>player.name),missingExamples:removedMissingFromCsv.slice(0,20).map(player=>player.name)},null,2));
if(!dryRun){await fs.writeFile(outputPath,JSON.stringify(players,null,2)+"\n","utf8");console.log(`Aggiornato ${outputPath}`)}
