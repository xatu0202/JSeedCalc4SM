class CR extends TinyMT{
  nextHex(){
    return super.GetNext32Bit().toString(16).toUpperCase();
  }
  nextInt(){
    return super.GetNext32Bit();
  }
}

function   viewMons(nowSeed){
  var tempSeed = nowSeed;
  var result = {};
  result.no = Number(nowSeed);
  //result.rng = MTSeed[nowSeed].toString(16).toUpperCase();
  //遺伝箇所決定のための配列とカウンタ
  var status = ["H", "A", "B", "C", "D", "S"];
  var inheriteStatus = [32, 32, 32, 32, 32, 32];
  var inheriteCount = 0;
  if(isNidoBaruIru != true){
    if(sType == "0"){
      nowSeed++;
      result.gender = ((MTSeed[nowSeed]%252 < sRate) ? "♀":"♂");
    }
    else result.gender = sType;
    nowSeed++;
    result.nature = nature[MTSeed[nowSeed]%25];
    //
    if(bothParentsEverstone){
      nowSeed++;
      result.nature = (MTSeed[nowSeed]%2) ? "後":"先";
    }
    else if(isEver)result.nature="かわらず";
    nowSeed++;
    switch(abilityType){
    case 0:
      result.ability = (MTSeed[nowSeed]%100 < abiType0) ? "1":"2";
      break;
    case 1:
      result.ability = (MTSeed[nowSeed]%100 < abiType1) ? "1":"2";
      break;
    case 2:
      if(abiType2_1 <= MTSeed[nowSeed]%100)result.ability = "夢";
      else if(MTSeed[nowSeed]%100 < abiType2_0)result.ability = "1";
      else result.ability = "2";
      break;
    }
    //
    if(bothParentsSamePower){
      nowSeed++;
      //(MTSeed[nowSeed]%2) ? "♀":"♂";
    }
    while(inheriteCount < inherites){
      nowSeed++;
      var temp = MTSeed[nowSeed]%6;
      if(inheriteStatus[temp] == 32){
        nowSeed++;
        var temp2 = MTSeed[nowSeed]%2;
        inheriteCount++;
        inheriteStatus[temp] = (temp2) ? fStatus[temp]:mStatus[temp]
      }
    }
    for(var i = 0; i < 6; i++){
      nowSeed++;
      var temp = MTSeed[nowSeed]%32;
      if(inheriteStatus[i] == 32)inheriteStatus[i] = temp;
      result[status[i]] = inheriteStatus[i];
    }
    nowSeed++;
   result.ENC = MTSeed[nowSeed].toString(16).toUpperCase();
    //PID;
    //ここわかってない
    for(var i = 0; i < rePID; i++){
      nowSeed++;

    }
      PSV = (((((MTSeed[nowSeed]&0xFFFF0000)>>16)^(MTSeed[nowSeed]&0x0000FFFF))>>4) < 0) ? ((((MTSeed[nowSeed]&0xFFFF0000)>>16)^(MTSeed[nowSeed]&0x0000FFFF))>>4)+4096 : ((((MTSeed[nowSeed]&0xFFFF0000)>>16)^(MTSeed[nowSeed]&0x0000FFFF))>>4);
      result.PSV = PSV;
      result.PID = MTSeed[nowSeed].toString(16).toUpperCase();
    if(isSameParent){
      nowSeed++;
      result.ball = (MTSeed[nowSeed]%100 < 50) ? "後":"先";
    }else {
      result.ball = "-";
    }
    nowSeed += 2;
    result.CSP = nowSeed-tempSeed;
    return result;
  }
}
//status[3]~[0]の入れ替え
function statusSort(s3210){
  temp = s3210.replace(/,/g," ").split(" ");
  return new Uint32Array([parseInt(temp[3],16),parseInt(temp[2],16),parseInt(temp[1],16),parseInt(temp[0],16)]);
}
function seedSet(){
  var seedform = document.getElementById("range_config").getElementsByTagName("input");
  var temp = statusSort(seedform[0].value);
  seedform[1].value = temp[0];
  seedform[2].value = temp[1];
  seedform[3].value = temp[2];
  seedform[4].value = temp[3];
}
//TinyMTの乱数リスト作成
function makeTable(n){
  console.log(rng.status + "をseedとして設定した表を作成します");
  Seed = [];
  SEED = [];
  MTSeed = [];
  for(var i = 0; i < n; i++){
    Seed[i] = new Uint32Array(rng.status);
    SEED[i] = [rng.status[3].toString(16).toUpperCase(),rng.status[2].toString(16).toUpperCase(),rng.status[1].toString(16).toUpperCase(),rng.status[0].toString(16).toUpperCase()];
    MTSeed[i] = rng.temper();
    rng.nextState();
  }
}
//絞り込み
function sortDB(key,value){
  var range = IDBKeyRange.only(value);
  var req = db.transaction("hatchList", "readwrite").objectStore("hatchList").index(key).openCursor(range);
  var result = [];
  req.onsuccess = function() {
    var cursor = this.result;
    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }else{
      db.transaction("hatchList", "readwrite").objectStore("hatchList").clear();
      for(var i in result){
        db.transaction("hatchList", "readwrite").objectStore("hatchList").put(result[i]);
      }
      show(result);
    }
  };
}
function sortDBRange(keys,count,mins,maxs){
  console.log(count,keys[count]);
  var range = IDBKeyRange.bound(mins[count],maxs[count],false,false);
  var req = db.transaction("hatchList", "readwrite").objectStore("hatchList").index(keys[count]).openCursor(range);
  var result = [];
  req.onsuccess = function() {
    var cursor = this.result;
    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    }else{
      var tr = db.transaction("hatchList", "readwrite").objectStore("hatchList");
      tr.clear();
      for(var i in result){
        tr.put(result[i]);
      }
      if(keys.length > count+1)sortDBRange(keys,count+1,mins,maxs);
      else show(result);
    }
  };

}
function exec(func){
db.transaction("hatchList", "readwrite").objectStore("hatchList").clear();
  var r = document.getElementById("range_config").getElementsByTagName("input");
  var tr = db.transaction("hatchList", "readwrite").objectStore("hatchList");
  for(var i = Number(r[5].value); i < Number(r[6].value); i++){
    var temp = viewMons(i);
    tr.put(temp);
  }
  var req=db.transaction("hatchList", "readwrite").objectStore("hatchList").getAll();
  req.onsuccess = function(ev){
    console.log(ev.target);
    func();
  }
}
function show(m){
  //console.log(m.length+"件中"+Math.min(m.length,100)+"件表示しています");
  var text = m.length+"件中"+Math.min(m.length,100)+"件表示しています\r\n";
  for(var i = 0; i < Math.min(m.length,100); i++){
    temp = m[i];
    //console.log(temp.no +","+ temp.CSP+","+ SEED[temp.no].toString() +","+ temp.H +","+ temp.A +","+ temp.B +","+ temp.C +","+ temp.D +","+ temp.S +","+ temp.gender +","+ temp.ability +","+ temp.nature +","+ temp.ball +","+ temp.PID +","+ temp.PSV +","+ temp.ENC +","+ MTSeed[temp.no].toString(16).toUpperCase());
    text += temp.no +","+ temp.CSP+","+ SEED[temp.no].toString() +","+ temp.H +","+ temp.A +","+ temp.B +","+ temp.C +","+ temp.D +","+ temp.S +","+ temp.gender +","+ temp.ability +","+ temp.nature +","+ temp.ball +","+ temp.PID +","+ temp.PSV +","+ temp.ENC +","+ MTSeed[temp.no].toString(16).toUpperCase()+"\r\n";
  }
  document.getElementById("result").getElementsByTagName("textarea")[0].innerHTML = (text);
}
function nw(s){
  nwin = window.open("", "output");
  nwin.document.open();
  nwin.document.write("<textarea style='width: 95%\;height:95%;'>"+s+"</textarea>");
  nwin.document.close();
}
//性格
var nature = ["がんばりや","さみしがり","ゆうかん","いじっぱり","やんちゃ","ずぶとい","すなお","のんき","わんぱく","のうてんき","おくびょう","せっかち","まじめ","ようき","むじゃき","ひかえめ","おっとり","れいせい","てれや","うっかりや","おだやか","おとなしい","なまいき","しんちょう","きまぐれ"];
//各種定数とかの設定
//ニドラン、バルビート、イルミーゼかのフラグ(FALSE)
var isNidoBaruIru = false;
//性別タイプ,0 or ♂,♀, -
var sType;
//性別判定の閾値
var sRate;
//両親がかわらずのいしを持っているかのフラグ
var bothParentsEverstone;
var isEver;
//♀親の特性種類
var abilityType;
//遺伝判定の閾値
var abiType0 = 80;
var abiType1 = 20;
var abiType2_0 = 20;
var abiType2_1 = 40;
//両親が同種のパワー系を持っているかのフラグ(FALSE)
var bothParentsSamePower = false;
//親のステータス
var mStatus;
var fStatus;
//あかいいと有無での遺伝数(3or5)
var inherites;
//ひかおま有無(+2)、国際孵化(+6)、どっちも(+8)
var rePID;
//両親が同じ種族ならボール遺伝判定
var isSameParent;
//TinyMTの初期化
rng = new CR(0);
//特定した現在SEEDの設定
//rng.status=new Uint32Array([0xD47F50D1,0x7E7FAE14,0x5ABDD9F8,0x2D1FDEF0]);

