/* MD Bot - lógica do site. Textos/dados editáveis ficam nos arrays (SP, FQ, DC, QZ...). Ajustes rápidos: js/config.js */
var $=function(i){
  return document.getElementById(i)
},I={
  stand:"img/stand.webp",wave:"img/wave.webp",think:"img/think.webp",ban:"img/ban.webp",coin:"img/coin.webp"
},S=[];
$("mq").innerHTML=Array(10).join("AUTOMAÇÃO  //  PODER  //  DISCORD  //  MESMO NOME, MESMAS CORES  //  ");
var ms=$("ms"),busy=0,pf=function(){
  return"hoje às "+new Date().toTimeString().slice(0,5)
};
function sl(t){
  return new Promise(function(r){
    setTimeout(r,t)
  })
}
function msg(bot,name,html){
  var d=document.createElement("div");
  d.className="m";
  d.innerHTML='<div class="av'+(bot?" bt2":"")+'" data-u="'+(bot?"bot":"user")+'">'+(bot?"":name[0])+'</div><div><span class="nm" data-u="'+(bot?"bot":"user")+'">'+name+(bot?'<span class="app">APP</span>':"")+"<small>"+pf()+"</small></span>"+html+"</div>";
  ms.appendChild(d);
  ms.scrollTop=1e5
}
var E={
  daily:["/daily",'<div class="emb" style="--c:#f0b232"><h4>Recompensa diária</h4><p>Você recebeu <b>+500 MD Coins</b>. Volte amanhã!</p><img class="t" src="'+I.coin+'"><div class="fd"><div><b>Saldo</b>2.350</div><div><b>Sequência</b>7 dias</div></div></div>'], ban:["/ban @spammer motivo:spam",'<div class="emb" style="--c:#8a1cff"><h4>Membro banido</h4><p><b>spammer</b> foi banido por spam de convites.</p><img class="t" src="'+I.ban+'"><div class="fd"><div><b>Moderador</b>Você</div><div><b>Caso</b>#0142</div></div></div><div class="bs"><span class="r">Desfazer</span><span>Ver log</span></div>'], rank:["/rank",'<div class="emb" style="--c:#16ff3c"><h4>Seu nível: 12</h4><p>1.840 / 2.500 XP · top 5 do servidor</p><div class="pb"><i style="width:74%"></i></div></div>'], loja:["/loja",'<div class="emb" style="--c:#8a1cff"><h4>Loja do servidor</h4><div class="fd"><div><b>Cargo VIP</b>5.000</div><div><b>Cor roxa</b>1.200</div></div></div><div class="bs"><span class="g">Comprar VIP</span><span>Cor roxa</span></div>'], ajuda:["/ajuda",'<div class="emb" style="--c:#5865f2"><h4>Central de ajuda</h4><p>Moderação, cargos, economia, recompensas e utilidades. Use <b>/</b> para ver tudo.</p><img class="t" src="'+I.wave+'"></div>']
};
async function run(k){
  if(busy)return;
  busy=1;
  var e=E[k],ib=$("ib");
  ib.textContent="";
  for(var i=0;i<e[0].length;i++){
    ib.innerHTML='<span>'+e[0].slice(0,i+1)+"</span>";
    await sl(35)
  }
  await sl(250);
  ib.textContent="";
  msg(0,window.UN||"Você",'<div class="cmdl">usou <span>'+e[0].split(" ")[0]+"</span></div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(1100);
  $("ty").textContent="";
  msg(1,"MD Bot",e[1]);
  setTimeout(function(){
    var p=ms.querySelector(".pb i:not(.d)");if(p){
      p.style.width=p.getAttribute("style").match(/\d+/)[0]+"%";p.className="d"
    }
  },60);
  busy=0
}
Object.keys(E).forEach(function(k){
  var b=document.createElement("button");b.textContent=E[k][0].split(" ")[0];b.onclick=function(){
    run(k)
  };$("ch").appendChild(b)
});
var fired=0,io=new IntersectionObserver(function(x){
  x.forEach(function(e){
    if(e.isIntersecting){
      e.target.classList.add("in");if(e.target.id=="demo"&&!fired){
        fired=1;run("ajuda").then(function(){
          return sl(1500)
        }).then(function(){
          run("daily")
        })
      }
    }
  })
},{
  threshold:.25
});
document.querySelectorAll(".rv").forEach(function(e){
  io.observe(e)
});
S.forEach(function(s,i){
  var m=document.createElement("img");m.src=s;m.style.setProperty("--r",(i%2?4:-4)+"deg");m.onclick=function(){
    msg(1,"MD Bot",'<img src="'+s+'" style="width:130px">');$("demo").scrollIntoView({
      behavior:"smooth"
    })
  };$("wl").appendChild(m)
});
var MD=[["Moderação","Servidor protegido de spam e raid."],
["Economia","MD Coins e loja funcionando."],
["Cargos","Cargos automáticos ativos."],
["Recompensas","Daily e níveis liberados."],
["IA","Respostas inteligentes ligadas."]];
MD.forEach(function(m){
  var d=document.createElement("div");d.className="tg on";d.innerHTML="<span>"+m[0]+'</span><i class="sw"></i>';d.onclick=function(){
    d.classList.toggle("on");var on=$("bd").querySelectorAll(".on").length;$("pi").src=on>3?I.cheer:on>0?I.think:I.sleep;$("pt").textContent=d.classList.contains("on")?m[1]:m[0]+" desligado.";
  };$("bd").appendChild(d)
});
var h=document.querySelector(".hero");
h.onmousemove=function(e){
  var x=(e.clientX/innerWidth-.5)*16,y=(e.clientY/innerHeight-.5)*10;
  $("hm").style.transform="translate("+x+"px,"+y+"px) rotate("+x/4+"deg)"
};
$("hm").onclick=function(){
  var k=Object.keys(I);
  this.src=I[k[Math.floor(Math.random()*k.length)]]
};
$("ct").onclick=function(){
  this.textContent="Anotado!"
};
var gb=$("gb"),gi=$("gi"),gt,UN=null,nm=function(){
  return UN||"visitante"
};
gi.src=I.stand;
function say(p,t,ms){
  if(window.MU)return;
  gi.src=I[p];
  gi.classList.remove("jp");
  void gi.offsetWidth;
  gi.classList.add("jp");
  gb.innerHTML="<span></span>";
  gb.className="gb on";
  var s=gb.firstChild,k=0;
  clearInterval(gt);
  gt=setInterval(function(){
    s.textContent=t.slice(0,++k);if(k>=t.length)clearInterval(gt)
  },22);
  clearTimeout(say.h);
  say.h=setTimeout(function(){
    gb.className="gb"
  },ms||6000)
}
function ask(){
  if(UN||window.MU)return;
  gi.src=I.think;
  gb.innerHTML='<span>Ei! Como posso te chamar?</span><input id="un" maxlength="14" placeholder="Seu nome + Enter">';
  gb.className="gb on";
  clearTimeout(say.h);
  say.h=setTimeout(function(){
    if(!UN&&document.activeElement!=$("un"))gb.className="gb"
  },9000);
  $("un").onkeydown=function(e){
    if(e.key=="Enter"&&this.value.trim()){
      UN=this.value.trim();
      say("wave","Fala, "+UN+"! Agora é com você: explora o site, eu te guio.",5000)
    }
  }
}
setTimeout(function(){
  say("wave","E aí! Eu sou o MD, bot oficial da MaisterDev Company.",4500)
},4200);
var SM=[["demo","think",function(){
  return"Olha só, "+nm()+": aperta um comando aí embaixo que eu respondo!"
}],
["mods","ban",function(){
  return"Moderação, economia, cargos... eu faço tudo, "+nm()+"."
}],
["painel","wave",function(){
  return"Aqui você manda em mim sem digitar nada. Liga e desliga!"
}],
["wl","coin",function(){
  return"Essas são minhas caras. Clica numa e eu mando no chat!"
}],
["faq","think",function(){
  return"Ficou com dúvida, "+nm()+"? Abre aí."
}],
["cta","coin",function(){
  return"Bora, "+nm()+"? Me convida quando eu lançar!"
}]];
var so=new IntersectionObserver(function(x){
  x.forEach(function(e){
    if(e.isIntersecting&&!(gb.className=="gb on"&&$("un"))){
      var s=e.target._s;if(s)say(s[1],s[2](),4500)
    }
  })
},{
  threshold:.4
});
SM.forEach(function(s){
  var el=$(s[0]);if(s[0]=="wl")el=el.parentNode;el._s=s;so.observe(el)
});
gi.onclick=function(){
  var T=["Clica nos comandos da demo, é divertido.","Tenta digitar mdb no teclado.","Mexe o mouse no topo, eu me mexo junto!","Liga e desliga os módulos no painel."],K=Object.keys(I);
  say(K[Math.floor(Math.random()*K.length)],T[Math.floor(Math.random()*4)],4000)
};
var kb="";
addEventListener("keydown",function(e){
  if(e.target.tagName=="INPUT")return;kb=(kb+e.key).slice(-3).toLowerCase();if(kb=="mdb"){
    rain();say("coin","Código secreto! +1000 MD Coins.",4000)
  }
});
function scr(el){
  var ns=[],w=document.createTreeWalker(el,4),n;
  while(n=w.nextNode())ns.push([n,n.nodeValue]);
  var f=0,C="01#@$%<>/MD",t=setInterval(function(){
    f++;ns.forEach(function(p){
      var o=p[1],r=Math.floor(o.length*f/20);p[0].nodeValue=o.split("").map(function(c,i){
        return i<r||c==" "?c:C[Math.floor(Math.random()*C.length)]
      }).join("")
    });if(f>=20)clearInterval(t)
  },40)
}
function cnt(el){
  var n=+el.dataset.n,k=0;
  if(!n)return;
  var t=setInterval(function(){
    el.textContent=++k;if(k>=n)clearInterval(t)
  },140)
}
document.querySelectorAll(".lead").forEach(function(l){
  l.dataset.t=l.textContent;l.textContent=""
});
var go=new IntersectionObserver(function(x){
  x.forEach(function(e){
    if(!e.isIntersecting)return;var t=e.target;go.unobserve(t);if(t.tagName=="H2")scr(t);else if(t.className=="lead"){
      var s=t.dataset.t,k=0,iv=setInterval(function(){
        t.textContent=s.slice(0,++k);if(k>=s.length)clearInterval(iv)
      },14)
    }else t.querySelectorAll("[data-n]").forEach(cnt)
  })
},{
  threshold:.5
});
document.querySelectorAll("h2,.lead,#stw").forEach(function(e){
  go.observe(e)
});
scr(document.querySelector(".hero h1"));
document.querySelectorAll(".tl div").forEach(function(d,i){
  d.style.animationDelay=(i%4)*.15+"s"
});
$("wl").childNodes.forEach(function(d,i){
  d.style.animationDelay=i*70+"ms"
});
function sc(){
  var m=document.body.scrollHeight-innerHeight;
  $("pg").style.width=scrollY/m*100+"%";
  document.querySelectorAll(".rw .mm").forEach(function(e){
    var r=e.getBoundingClientRect();e.style.transform="translateY("+(r.top+r.height/2-innerHeight/2)*-.1+"px)"
  })
}
addEventListener("scroll",sc);
sc();
function rain(){
  for(var i=0;i<22;i++){
    var d=document.createElement("img");
    d.src=I.coin;
    d.style.cssText="position:fixed;z-index:70;pointer-events:none;width:44px;top:-60px;left:"+Math.random()*95+"vw";
    document.body.appendChild(d);
    d.animate([{
      transform:"translateY(0) rotate(0)"
    },{
      transform:"translateY("+(innerHeight+80)+"px) rotate(540deg)"
    }],{
      duration:1400+Math.random()*1400,delay:Math.random()*600,fill:"backwards"
    }).onfinish=function(){
      this.effect.target.remove()
    }
  }
}
addEventListener("click",function(e){
  for(var i=0;i<8;i++){
    var d=document.createElement("i");d.style.cssText="position:fixed;z-index:70;pointer-events:none;width:8px;height:8px;left:"+e.clientX+"px;top:"+e.clientY+"px;background:"+(i%2?"#16ff3c":"#8a1cff");document.body.appendChild(d);d.animate([{
      transform:"translate(0,0)",opacity:1
    },{
      transform:"translate("+Math.cos(i*.785)*55+"px,"+Math.sin(i*.785)*55+"px) rotate(200deg)",opacity:0
    }],{
      duration:600
    }).onfinish=function(){
      this.effect.target.remove()
    }
  }
});
var PD={
  daily:"Resgata suas moedas diárias",ban:"Bane um membro",rank:"Mostra seu nível e XP",loja:"Abre a loja do servidor",ajuda:"Central de ajuda"
},pp=document.createElement("div");
pp.className="pp";
document.querySelector(".mn").appendChild(pp);
function hp(){
  pp.className="pp"
}
Object.keys(PD).forEach(function(k){
  var d=document.createElement("div");d.innerHTML="<b>/"+k+"</b><small>"+PD[k]+"</small>";d.onclick=function(e){
    e.stopPropagation();hp();run(k)
  };pp.appendChild(d)
});
$("ib").onclick=function(e){
  e.stopPropagation();
  if(!busy)pp.className="pp on"
};
document.addEventListener("click",hp);
var o=run;
run=function(k){
  hp();
  return o(k).then(function(){
    if(k=="daily"){
      rain();say("coin","Chuva de moedas! Esse daily foi bom.",3500)
    }
    if(k=="ban"){
      $("demo").querySelector(".dc").animate([{
        transform:"translateX(-10px)"
      },{
        transform:"translateX(10px)"
      },{
        transform:"none"
      }],{
        duration:300,iterations:2
      });say("angry","Banido! Martelo roxo não perdoa.",3500)
    }
    if(k=="rank")say("stand","Tá subindo de nível, hein!",3000);if(k=="loja")say("think","Hmm, o que será que você vai comprar?",3000)
  })
};
var hc=document.createElement("canvas");
hc.style.cssText="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none";
h.insertBefore(hc,h.firstChild);
var cx=hc.getContext("2d"),ps=[];
function rz(){
  hc.width=h.offsetWidth;
  hc.height=h.offsetHeight
}
rz();
addEventListener("resize",rz);
for(var i=0;i<45;i++)ps.push({
  x:Math.random()*1500,y:Math.random()*900,v:.4+Math.random()*1.2,s:3+Math.random()*7,c:i%2?"#16ff3c":"#8a1cff"
});
(function f(){
  cx.clearRect(0,0,hc.width,hc.height);ps.forEach(function(p){
    p.y-=p.v;p.x+=Math.sin(p.y/40)*.5;if(p.y<-10){
      p.y=hc.height+10;p.x=Math.random()*hc.width
    }
    cx.fillStyle=p.c;cx.globalAlpha=.55;cx.fillRect(p.x,p.y,p.s,p.s)
  });requestAnimationFrame(f)
})();
var MU=0,gx=document.createElement("button");
gx.className="gx";
gx.textContent="Silenciar guia";
document.querySelector(".gd").appendChild(gx);
gx.onclick=function(){
  MU=!MU;
  gx.textContent=MU?"Ativar guia":"Silenciar guia";
  if(MU)gb.className="gb"
};
$("dvx").onclick=function(){
  this.parentNode.remove()
};
document.querySelectorAll(".tl small").forEach(function(s){
  var m=s.textContent.match(/^FASE (\d)/);if(m)s.textContent="FASE "+m[1]+" / "+(m[1]==1?"EM ANDAMENTO":"PLANEJADO")
});
var hb=document.createElement("button");
hb.className="hbg";
hb.innerHTML="<i></i><i></i><i></i>";
hb.setAttribute("aria-label","Menu");
document.querySelector(".top").appendChild(hb);
var mn=document.createElement("div");
mn.className="mnu";
mn.innerHTML=[["demo","Demo"],
["mods","Módulos"],
["painel","Painel"],
["docs","Comandos"],
["studio","Studio"],
["embed","Embed"],
["faq","FAQ"]].map(function(a){
  return'<a href="#'+a[0]+'">'+a[1]+"</a>"
}).join("")+'<a href="#cta" id="mw">Quero acesso</a>';
document.body.appendChild(mn);
hb.onclick=function(){
  mn.classList.toggle("on");
  hb.classList.toggle("x")
};
mn.onclick=function(){
  mn.classList.remove("on");
  hb.classList.remove("x")
};
var md=document.createElement("div");
md.id="md";
md.innerHTML='<div class="mb"><h3>Lista de espera</h3><p>O MD Bot ainda está em desenvolvimento. Deixe seu e-mail para saber do lançamento.</p><input id="em" type="email" placeholder="seu@email.com" autocomplete="email"><input id="sn" placeholder="Nome do seu servidor (opcional)"><small id="er"></small><button class="bt" id="ok">Entrar na lista</button><button class="bt v" id="cx">Fechar</button></div>';
document.body.appendChild(md);
function om(e){
  if(e)e.preventDefault();
  md.classList.add("on");
  $("er").textContent=""
}
function cm(){
  md.classList.remove("on")
}
$("nvb").onclick=om;
$("ct").onclick=om;
$("mw").addEventListener("click",om);
$("cx").onclick=cm;
md.onclick=function(e){
  if(e.target==md)cm()
};
addEventListener("keydown",function(e){
  if(e.key=="Escape")cm()
});
$("ok").onclick=function(){
  var v=$("em").value.trim(),er=$("er");
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){
    er.style.color="#ff6b6b";
    er.textContent="Digite um e-mail válido.";
    return
  }
  var L=[];
  try{
    L=JSON.parse(localStorage.getItem("mdwl")||"[]")
  }catch(e){}if(L.some(function(x){
    return x.e==v
  })){
    er.style.color="#16ff3c";
    er.textContent="Este e-mail já está na lista.";
    return
  }
  L.push({
    e:v,s:$("sn").value.trim()
  });
  try{
    localStorage.setItem("mdwl",JSON.stringify(L))
  }catch(e){}er.style.color="#16ff3c";
  er.textContent="Cadastro salvo neste navegador. A lista oficial abre junto com o site de lançamento.";
  $("em").value="";
  $("sn").value="";
  say("love","Anotado! Obrigado pelo interesse.",4000)
};
var fi=document.createElement("input");
fi.id="fi2";
fi.placeholder="Digite /comando ou pergunte algo";
fi.setAttribute("enterkeyhint","send");
$("ch").appendChild(fi);
function rep(t){
  t=t.toLowerCase();
  var R=[[/ban|kick|mute|modera|spam/,"Moderação: ban, kick, mute, warn, antispam e logs. Tudo registrado."],
  [/moeda|economia|loja|daily|dinheiro/,"Economia: MD Coins, loja, transferências e daily com sequência."],
  [/cargo|role|permiss/,"Cargos: automáticos, por reação e por nível, com permissões organizadas."],
  [/painel|dashboard|site/,"O painel web permite configurar tudo sem digitar comandos."],
  [/quando|lança|lanca|dispon|pronto|usar/,"Ainda estou em desenvolvimento. Entre na lista de espera para saber do lançamento."],
  [/pre[cç]o|plano|gr[aá]tis|pago/,"Os planos ainda estão em definição."],
  [/^(oi|ol[aá]|e a[ií])/,"Olá! Eu sou o MD Bot, da MaisterDev Company. Pergunte sobre meus módulos."]];
  for(var i=0;i<R.length;i++)if(R[i][0].test(t))return R[i][1];
  return"Ainda estou aprendendo isso. Tente: moderação, economia, cargos, painel ou lançamento."
}
fi.onkeydown=async function(e){
  if(e.key!="Enter"||busy)return;
  var v=this.value.trim();
  if(!v)return;
  this.value="";
  var k=v.replace("/","").split(" ")[0].toLowerCase();
  if(v[0]=="/"&&E[k]){
    run(k);
    return
  }
  busy=1;
  msg(0,window.UN||"Você","<div>"+v.replace(/</g,"&lt;")+"</div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(900);
  $("ty").textContent="";
  msg(1,"MD Bot","<div>"+rep(v)+"</div>");
  busy=0
};
$("ib").onclick=function(e){
  e.stopPropagation();
  if(busy)return;
  pp.style.bottom=(this.offsetParent.clientHeight-this.offsetTop+4)+"px";
  pp.className="pp on"
};
var TG=$("bd").querySelectorAll(".tg"),sv=[];
try{
  sv=JSON.parse(localStorage.getItem("mdset")||"[]")
}catch(e){} function svs(){
  try{
    localStorage.setItem("mdset",JSON.stringify([].map.call(TG,function(x){
      return x.classList.contains("on")?1:0
    })))
  }catch(e){}
}
TG.forEach(function(d,i){
  if(sv[i]===0)d.classList.remove("on");d.addEventListener("click",svs)
});
var rs=document.createElement("button");
rs.className="bt v";
rs.textContent="Restaurar padrão";
rs.style.marginTop="20px";
rs.onclick=function(){
  TG.forEach(function(d){
    d.classList.add("on")
  });
  svs();
  $("pi").src=I.wave;
  $("pt").textContent="Tudo ligado. Servidor protegido."
};
$("bd").appendChild(rs);
(function(){
  var l=$("ld"),f=$("lf"),t=$("lt"),p=0,st=["Iniciando núcleo","Carregando módulos","Conectando ao Discord","Preparando painel","Pronto"],t0=Date.now(),done=0;document.body.style.overflow="hidden";var iv=setInterval(function(){
    p=Math.min(done?100:90,p+Math.random()*6+1);f.style.width=p+"%";$("lp").textContent=Math.floor(p)+"%";t.textContent=st[Math.min(4,Math.floor(p/22))];if(p>=100){
      clearInterval(iv);setTimeout(function(){
        l.classList.add("off");document.body.style.overflow="";setTimeout(function(){
          l.remove()
        },700)
      },350)
    }
  },90);function fin(){
    setTimeout(function(){
      done=1
    },Math.max(0,2400-(Date.now()-t0)))
  }
  document.readyState=="complete"?fin():addEventListener("load",fin)
})();
var NR=[];
NR.forEach(function(s){
  var m=document.createElement("img");m.src=s;m.style.setProperty("--r","-4deg");m.onclick=function(){
    msg(1,"MD Bot",'<img src="'+s+'" style="width:130px">');say("wave","Reação enviada no chat da demo.",2500)
  };$("wl").appendChild(m)
});
var PS=[["Acenando",I.wave],
["Em pé",I.stand],
["Pensando",I.think],
["Martelo",I.ban],
["Moedas",I.coin]].concat(S.map(function(s,i){
  return["Reação "+(i+1),s]
})).concat(NR.map(function(s,i){
  return["Nova "+(i+1),s]
})),pose=0,bst=0,cv2=$("sc"),c2=cv2.getContext("2d"),IM={};
function mark(id,i){
  [].forEach.call($(id).children,function(x,k){
    x.classList.toggle("on",k==i)
  })
}
PS.forEach(function(p,i){
  var b=document.createElement("button");b.title=p[0];b.innerHTML='<img src="'+p[1]+'" alt="">';b.onclick=function(){
    pose=i;mark("pk",i);dr()
  };$("pk").appendChild(b);var im=new Image;im.onload=dr;im.src=p[1];IM[i]=im
});
mark("pk",0);
var BC=[["#ffffff","#000000"],
["#16ff3c","#000000"],
["#8a1cff","#ffffff"]];
BC.forEach(function(c,i){
  var b=document.createElement("button");b.innerHTML='<i style="background:'+c[0]+'"></i>';b.onclick=function(){
    bst=i;mark("sty",i);dr()
  };$("sty").appendChild(b)
});
mark("sty",0);
function dr(){
  var im=IM[pose];
  c2.clearRect(0,0,640,640);
  if(im&&im.complete&&im.naturalWidth){
    var r=Math.min(600/im.naturalWidth,500/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;
    c2.drawImage(im,(640-w)/2,640-h-6,w,h)
  }
  var t=($("stx").value||" ").toUpperCase(),fs=54,fn=function(){
    c2.font="400 "+fs+"px Bungee,Impact,sans-serif"
  };
  fn();
  while(c2.measureText(t).width>520&&fs>20){
    fs-=2;
    fn()
  }
  var w2=c2.measureText(t).width+56,x=(640-w2)/2,y=14,hh=fs+40,B=BC[bst];
  c2.lineWidth=7;
  c2.strokeStyle="#000";
  c2.fillStyle=B[0];
  c2.beginPath();
  c2.rect(x,y,w2,hh);
  c2.fill();
  c2.stroke();
  c2.beginPath();
  c2.moveTo(300,y+hh);
  c2.lineTo(340,y+hh);
  c2.lineTo(320,y+hh+30);
  c2.closePath();
  c2.fill();
  c2.stroke();
  c2.fillRect(304,y+hh-5,32,10);
  c2.fillStyle=B[1];
  c2.textAlign="center";
  c2.textBaseline="middle";
  c2.fillText(t,320,y+hh/2+3)
}
$("stx").oninput=dr;
dr();
if(document.fonts)document.fonts.ready.then(dr);
var pm=document.createElement("div");
pm.id="pvm";
pm.innerHTML='<div class="mb" style="text-align:center"><h3>Sua reação</h3><img id="pvi" alt=""><p id="pvt">Clique com o botão direito (ou segure o dedo) na imagem para salvar.</p><button class="bt" id="pvc">Copiar imagem</button><button class="bt v" id="pvx">Fechar</button></div>';
document.body.appendChild(pm);
$("dl").onclick=function(){
  $("pvi").src=cv2.toDataURL("image/png");
  $("pvt").textContent="Clique com o botão direito (ou segure o dedo) na imagem para salvar.";
  pm.classList.add("on")
};
$("pvx").onclick=function(){
  pm.classList.remove("on")
};
pm.onclick=function(e){
  if(e.target==pm)pm.classList.remove("on")
};
$("pvc").onclick=function(){
  try{
    cv2.toBlob(function(b){
      navigator.clipboard.write([new ClipboardItem({
        "image/png":b
      })]).then(function(){
        $("pvt").textContent="Imagem copiada."
      }).catch(function(){
        $("pvt").textContent="Não foi possível copiar. Salve segurando a imagem."
      })
    })
  }catch(e){
    $("pvt").textContent="Não foi possível copiar. Salve segurando a imagem."
  }
};
$("sd").onclick=function(){
  msg(0,window.UN||"Você",'<img src="'+cv2.toDataURL("image/png")+'" style="width:170px">');
  $("demo").scrollIntoView({
    behavior:"smooth"
  });
  say("coin","Reação enviada no chat!",3000)
};
var EC=["#8a1cff","#16ff3c","#f0b232","#da373c","#5865f2"],ec=0;
EC.forEach(function(c,i){
  var b=document.createElement("button");b.innerHTML='<i style="background:'+c+'"></i>';b.onclick=function(){
    ec=i;mark("ec",i);ue()
  };$("ec").appendChild(b)
});
mark("ec",0);
function esc(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")
}
function ue(){
  $("p1").textContent=$("et").value;
  $("p2").textContent=$("ed").value;
  $("ep").style.setProperty("--c",EC[ec]);
  var k=$("eimg").value;
  $("p3").style.display=k=="none"?"none":"block";
  if(k!="none")$("p3").src=I[k];
  $("p4").textContent=$("eb").value;
  $("p4").parentNode.style.display=$("eb").value?"flex":"none"
}
["et","ed","eb","eimg"].forEach(function(i){
  $(i).oninput=ue
});
ue();
$("es").onclick=function(){
  var k=$("eimg").value;
  msg(1,"MD Bot",'<div class="emb" style="--c:'+EC[ec]+'"><h4>'+esc($("et").value)+"</h4><p>"+esc($("ed").value)+"</p>"+(k!="none"?'<img class="t" src="'+I[k]+'">':"")+"</div>"+($("eb").value?'<div class="bs"><span>'+esc($("eb").value)+"</span></div>":""));
  $("demo").scrollIntoView({
    behavior:"smooth"
  });
  say("wave","Embed enviado no chat da demo.",3000)
};
var SK=[["Node.js","Núcleo do bot e da API"],
["discord.js","Conexão com o Discord"],
["React","Interface do site e do painel"],
["Vite","Build rápido do front-end"],
["Express","API do projeto"],
["PostgreSQL","Banco de dados principal"],
["Prisma","Acesso tipado ao banco"],
["Redis","Cache, opcional"],
["Zod","Validação de dados"],
["Docker","Ambiente padronizado"]];
SK.forEach(function(s){
  var d=document.createElement("button");d.className="chp";d.textContent=s[0];d.title=s[1];d.onclick=function(){
    say("think",s[0]+": "+s[1]+".",3500)
  };void 0
});
[["studio","wave","Cria uma reação minha e manda no chat!"],
["embed","think","Monte um embed e veja como fica no Discord."]].forEach(function(s){
  var el=$(s[0]);el._s=[0,s[1],function(){
    return s[2]
  }];so.observe(el)
});
var rm=0;
try{
  rm=localStorage.getItem("mdrm")=="1"
}catch(e){}var rb=document.createElement("button");
function rmu(){
  document.body.classList.toggle("rm",rm);
  rb.textContent=rm?"Ativar animações":"Reduzir animações"
}
rb.onclick=function(){
  rm=!rm;
  try{
    localStorage.setItem("mdrm",rm?"1":"0")
  }catch(e){}rmu()
};
document.querySelector("footer").appendChild(rb);
rmu();
var up=document.createElement("button");
up.className="up";
up.textContent="TOPO";
up.onclick=function(){
  scrollTo({
    top:0,behavior:"smooth"
  })
};
document.body.appendChild(up);
addEventListener("scroll",function(){
  up.classList.toggle("on",scrollY>700)
});
addEventListener("keydown",function(e){
  if(e.key=="/"&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){
    e.preventDefault();$("demo").scrollIntoView({
      behavior:"smooth"
    });setTimeout(function(){
      $("fi2").focus()
    },500)
  }
});
var mnE=document.querySelector(".mn"),jm=document.createElement("button");
jm.className="jmp";
jm.textContent="Novas mensagens";
mnE.appendChild(jm);
function nb(){
  return ms.scrollHeight-ms.scrollTop-ms.clientHeight<60
}
function msg(bot,name,html,rx){
  var near=nb(),d=document.createElement("div");
  d.className="m";
  d.innerHTML='<div class="av'+(bot?" bt2":"")+'" data-u="'+(bot?"bot":"user")+'">'+(bot?"":name[0])+'</div><div><span class="nm" data-u="'+(bot?"bot":"user")+'">'+name+(bot?'<span class="app">APP</span>':"")+"<small>"+pf()+"</small></span>"+html+rxh(rx)+"</div>"+ACT;
  ms.appendChild(d);
  while(ms.children.length>60)ms.removeChild(ms.children[1]);
  if(near||!bot)ms.scrollTop=ms.scrollHeight;
  else{
    jm.style.bottom=(mnE.clientHeight-ms.offsetTop-ms.offsetHeight+10)+"px";
    jm.className="jmp on"
  }
}
ms.addEventListener("scroll",function(){
  if(nb())jm.className="jmp"
});
jm.onclick=function(){
  ms.scrollTo({
    top:ms.scrollHeight,behavior:"smooth"
  });
  jm.className="jmp"
};
function clr(){
  ms.innerHTML='<div class="sys">Início do canal #comandos. Toque num comando abaixo ou digite / para ver a lista.</div>';
  jm.className="jmp"
}
clr();
document.querySelector(".mh").innerHTML='<span># comandos</span><button id="clr">Limpar</button>';
$("clr").onclick=clr;
E.ping=["/ping",'<div class="emb" style="--c:#16ff3c"><h4>Pong!</h4><p>Latência do gateway: <b>42 ms</b> (valor de demonstração)</p></div>'];
E.status=["/status",'<div class="emb" style="--c:#5865f2"><h4>Status do MD Bot</h4><div class="fd"><div><b>Estado</b>Em desenvolvimento</div><div><b>Módulos</b>5 planejados</div></div></div>'];
E.enquete=["/enquete",'<div class="emb" style="--c:#8a1cff"><h4>Enquete</h4><p>Qual módulo você quer primeiro?</p></div><div class="bs"><span>Moderação</span><span>Economia</span><span>Cargos</span></div>'];
E.sorteio=["/sorteio",'<div class="emb" style="--c:#f0b232"><h4>Sorteio ativo</h4><p>Prêmio: <b>Cargo VIP</b>. Termina em 24 horas.</p><img class="t" src="'+I.coin+'"></div><div class="bs"><span class="g">Participar</span></div>'];
ms.addEventListener("click",function(e){
  var t=e.target;if(t.parentNode&&t.parentNode.className=="bs"&&!t.classList.contains("dn")){
    t.classList.add("dn");var R={
      "Desfazer":"Banimento revertido. O membro foi desbanido.","Ver log":"Caso #0142: banido por spam de convites.","Comprar VIP":"Compra concluída: Cargo VIP adicionado.","Cor roxa":"Compra concluída: cor roxa liberada.","Participar":"Você está participando do sorteio.","Moderação":"Voto registrado em Moderação.","Economia":"Voto registrado em Economia.","Cargos":"Voto registrado em Cargos."
    };msg(1,"MD Bot","<div>"+(R[t.textContent]||"Ação registrada.")+"</div>")
  }
});
run=async function(k){
  if(busy)return;
  var e=E[k];
  if(!e)return;
  busy=1;
  hp();
  var f=$("fi2");
  f.value="";
  for(var i=0;i<e[0].length;i++){
    f.value=e[0].slice(0,i+1);
    await sl(28)
  }
  await sl(200);
  f.value="";
  msg(0,window.UN||"Você",'<div class="cmdl">usou <span>'+e[0].split(" ")[0]+"</span></div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(900);
  $("ty").textContent="";
  msg(1,"MD Bot",e[1],RX[k]);
  busy=0;
  if(k=="daily"){
    rain();
    say("coin","Chuva de moedas! Esse daily foi bom.",3500)
  }else if(k=="ban"){
    $("demo").querySelector(".dc").animate([{
      transform:"translateX(-10px)"
    },{
      transform:"translateX(10px)"
    },{
      transform:"none"
    }],{
      duration:300,iterations:2
    });
    say("angry","Banido! Martelo roxo não perdoa.",3500)
  }else if(k=="rank")say("stand","Tá subindo de nível, hein!",3000);
  else if(k=="loja")say("think","Hmm, o que será que você vai comprar?",3000)
};
function cmd(k){
  if(k=="limpar")clr();
  else run(k)
}
var cmpE=document.createElement("div");
cmpE.className="cmp";
cmpE.appendChild(fi);
var sb=document.createElement("button");
sb.textContent="Enviar";
cmpE.appendChild(sb);
mnE.appendChild(cmpE);
$("ch").innerHTML="";
Object.keys(E).concat(["limpar"]).forEach(function(k){
  var b=document.createElement("button");b.textContent="/"+k;b.onclick=function(){
    cmd(k)
  };$("ch").appendChild(b)
});
PD={
  daily:"Resgata suas moedas diárias",ban:"Bane um membro",rank:"Mostra seu nível e XP",loja:"Abre a loja do servidor",ajuda:"Central de ajuda",ping:"Mostra a latência",status:"Estado do MD Bot",enquete:"Cria uma enquete",sorteio:"Inicia um sorteio",limpar:"Limpa o chat"
};
function sp(q){
  pp.innerHTML="";
  var ks=Object.keys(PD).filter(function(k){
    return k.indexOf(q)==0
  });
  if(!ks.length){
    hp();
    return
  }
  ks.forEach(function(k){
    var d=document.createElement("div");d.innerHTML="<b>/"+k+"</b><small>"+PD[k]+"</small>";d.onclick=function(e){
      e.stopPropagation();hp();fi.value="";cmd(k)
    };pp.appendChild(d)
  });
  pp.style.bottom=(mnE.clientHeight-cmpE.offsetTop+6)+"px";
  pp.className="pp on"
}
fi.oninput=function(){
  var v=this.value;
  if(v[0]=="/"&&!busy)sp(v.slice(1).split(" ")[0].toLowerCase());
  else hp()
};
fi.onfocus=function(){
  if(!this.value&&!busy&&innerWidth>860)sp("")
};
async function send(){
  if(busy)return;
  var v=fi.value.trim();
  if(!v)return;
  hp();
  var k=v.replace("/","").split(" ")[0].toLowerCase();
  if(v[0]=="/"&&(k=="limpar"||E[k])){
    fi.value="";
    cmd(k);
    return
  }
  fi.value="";
  busy=1;
  msg(0,window.UN||"Você","<div>"+esc(v)+"</div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(900);
  $("ty").textContent="";
  msg(1,"MD Bot","<div>"+(v[0]=="/"?"Comando desconhecido. Digite / para ver a lista.":rep(v))+"</div>",[v[0]=="/"?"scared":"think"]);
  busy=0
}
fi.onkeydown=function(e){
  if(e.key=="Enter"){
    e.preventDefault();
    send()
  }
};
sb.onclick=send;
var gdE=document.querySelector(".gd");
new IntersectionObserver(function(x){
  var on=x[0].isIntersecting&&innerWidth<=860;gdE.classList.toggle("gh",on);up.classList.toggle("gh",on)
},{
  threshold:.15
}).observe($("demo").querySelector(".dc"));
var NI={
  "think": "img/think.webp", "angry": "img/angry.webp", "lol": "img/lol.webp", "cheer": "img/cheer.webp", "love": "img/love.webp", "scared": "img/scared.webp", "sleep": "img/sleep.webp", "point": "img/point.webp"
};
Object.assign(I,NI);
var RL=[["wave","Oi"],
["cheer","Comemorando"],
["lol","Chorando de rir"],
["point","Zoando"],
["love","Apaixonado"],
["angry","Brabo"],
["scared","Assustado"],
["think","Pensando"],
["sleep","Dormindo"],
["coin","Rico"],
["ban","Banindo"],
["stand","De boa"]];
var RX={
  daily:["cheer","coin"],ban:["angry","scared"],rank:["cheer","love"],loja:["think","coin"],ajuda:["wave","love"],ping:["point"],status:["stand"],enquete:["think"],sorteio:["coin","cheer"]
};
function rxh(rx){
  if(!rx)return"";
  return'<div class="rx">'+rx.map(function(k,i){
    return'<span class="rp" data-n="'+(i+2)+'"><img src="'+I[k]+'" alt=""><b>'+(i+2)+"</b></span>"
  }).join("")+"</div>"
}
ms.addEventListener("click",function(e){
  var p=e.target.closest&&e.target.closest(".rp");if(!p)return;var n=+p.dataset.n;p.classList.toggle("on");p.querySelector("b").textContent=p.classList.contains("on")?n+1:n
});
var wl=$("wl");
wl.innerHTML="";
wl.className="rxg";
RL.forEach(function(r,i){
  var f=document.createElement("button");f.className="rxc";f.style.animationDelay=i*60+"ms";f.innerHTML='<img src="'+I[r[0]]+'" alt=""><span>'+r[1]+"</span>";f.onclick=function(){
    msg(1,"MD Bot",'<img src="'+I[r[0]]+'" style="width:120px">',[r[0]]);$("demo").scrollIntoView({
      behavior:"smooth"
    });say(r[0],"Reação enviada: "+r[1]+".",2500)
  };wl.appendChild(f)
});
PS.length=0;
$("pk").innerHTML="";
IM={};
RL.forEach(function(r,i){
  PS.push([r[1],I[r[0]]]);var b=document.createElement("button");b.title=r[1];b.innerHTML='<img src="'+I[r[0]]+'" alt="">';b.onclick=function(){
    pose=i;mark("pk",i);dr()
  };$("pk").appendChild(b);var im=new Image;im.onload=dr;im.src=I[r[0]];IM[i]=im
});
pose=0;
mark("pk",0);
dr();
$("eimg").innerHTML=RL.map(function(r){
  return'<option value="'+r[0]+'">'+r[1]+"</option>"
}).join("")+'<option value="none">Sem imagem</option>';
ue();
var rep0=rep;
rep=function(t){
  t=t.toLowerCase();
  if(/kkk|haha|rsrs/.test(t))return'<img src="'+I.lol+'" style="width:110px"><br>Boa essa!';
  if(/obrigad|valeu|amei|gostei/.test(t))return'<img src="'+I.love+'" style="width:110px"><br>Tamo junto!';
  if(/sono|dormi|zzz/.test(t))return'<img src="'+I.sleep+'" style="width:110px"><br>Zzz... acordei agora.';
  if(/raiva|odeio|bug|ruim/.test(t))return"Calma! Anote o problema que a equipe corrige.";
  return rep0(t)
};
document.querySelectorAll(".rw .mm img")[2].src=I.think;
document.querySelector(".cta img").src=I.cheer;
[["cheer","Recompensas e níveis","#16ff3c",["Daily com sequência","Níveis e XP por atividade","Cargos como prêmio"],"Nível 12 alcançado","Parabéns! Você subiu de nível."],
["lol","Diversão e comunidade","#8a1cff",["Enquetes e sorteios","Interações para engajar","Boas-vindas automáticas"],"Sorteio ativo","Prêmio: Cargo VIP."],
["angry","Segurança e logs","#16ff3c",["Antispam e proteção contra raid","Logs de moderação","Permissões organizadas"],"Alerta de segurança","Convites suspeitos bloqueados."]].forEach(function(x){
  var d=document.createElement("div");d.className="rw rv";d.style.setProperty("--bgc",x[2]);d.innerHTML='<div class="mm"><img src="'+I[x[0]]+'" alt=""></div><div><h3>'+x[1]+"</h3><ul>"+x[3].map(function(l){
    return"<li>"+l+"</li>"
  }).join("")+'</ul><div class="emb" style="--c:'+x[2]+'"><h4>'+x[4]+"</h4><p>"+x[5]+"</p></div></div>";$("mods").appendChild(d);io.observe(d)
});
[["wave","01","Convide","Adicione o MD Bot ao seu servidor com um clique, quando o lançamento chegar."],
["think","02","Configure","Use o painel web para ligar os módulos que fazem sentido para a sua comunidade."],
["cheer","03","Automatize","Moderação, economia e cargos funcionando sozinhos, com tudo registrado."]].forEach(function(s){
  var d=document.createElement("div");d.innerHTML='<img src="'+I[s[0]]+'" alt=""><small>PASSO '+s[1]+"</small><h3>"+s[2]+"</h3>"+s[3];$("hw").appendChild(d)
});
function cp(){
  var n=+$("rg").value;
  $("rn").textContent=n;
  $("r1").textContent=n;
  $("r2").textContent=n;
  $("rim").src=I[n<=3?"think":n<=7?"point":n<=10?"scared":"lol"];
  $("rtx").textContent=n<=3?"Ainda dá para organizar, mas dá para simplificar.":n<=7?"É bastante coisa para gerenciar. Com o MD Bot, vira uma só.":n<=10?"Socorro! São bots demais.":"Isso já é um Frankenstein de bots!"
}
$("rg").oninput=cp;
cp();
var QZ=[["Gamer / Comunidade","cheer",["Moderação e antispam","Economia e recompensas","Enquetes e sorteios"]],
["Loja / Vendas","coin",["Loja e economia","Cargos por compra","Logs e segurança"]],
["Estudos / Projetos","think",["Cargos por turma","Lembretes e avisos","IA para dúvidas"]],
["Criador de conteúdo","love",["Boas-vindas e cargos","Níveis e recompensas","Enquetes com a audiência"]]];
function qs(i,q0){
  var q=QZ[i];
  [].forEach.call($("qo").children,function(x,k){
    x.classList.toggle("on",k==i)
  });
  $("qi").src=I[q[1]];
  $("qh").textContent="Para "+q[0].toLowerCase();
  $("ql").innerHTML=q[2].map(function(l){
    return"<li>"+l+"</li>"
  }).join("");
  if(!q0)say(q[1],"Boa escolha! Esses módulos combinam com você.",3000)
}
QZ.forEach(function(q,i){
  var b=document.createElement("button");b.className="opt";b.textContent=q[0];b.onclick=function(){
    qs(i)
  };$("qo").appendChild(b)
});
qs(0,1);
var DC=[["ban","Moderação","/ban @usuário [motivo]","Bane um membro do servidor e registra o caso."],
["kick","Moderação","/kick @usuário [motivo]","Expulsa um membro."],
["mute","Moderação","/mute @usuário [tempo]","Silencia um membro por um período."],
["warn","Moderação","/warn @usuário [motivo]","Registra um aviso no histórico."],
["clear","Moderação","/clear [quantidade]","Apaga mensagens em massa."],
["daily","Economia","/daily","Resgata a recompensa diária."],
["saldo","Economia","/saldo [@usuário]","Mostra as MD Coins."],
["loja","Economia","/loja","Abre a loja do servidor."],
["transferir","Economia","/transferir @usuário valor","Envia moedas a outro membro."],
["rank","Recompensas","/rank [@usuário]","Mostra nível e XP."],
["cargo","Cargos","/cargo adicionar @usuário @cargo","Atribui um cargo."],
["autorole","Cargos","/autorole @cargo","Define o cargo automático de entrada."],
["enquete","Utilidades","/enquete pergunta opções","Cria uma enquete."],
["sorteio","Utilidades","/sorteio prêmio duração","Inicia um sorteio."],
["lembrete","Utilidades","/lembrete tempo texto","Cria um lembrete."],
["ping","Utilidades","/ping","Mostra a latência."],
["ajuda","Utilidades","/ajuda","Abre a central de ajuda."]],dcat="Todos";
function sd(c){
  $("dd").innerHTML="<h3>/"+c[0]+"</h3><small>"+c[1]+' / planejado</small><p><code>'+esc(c[2])+"</code></p><p>"+c[3]+'</p><button class="bt" id="dt">Testar na demo</button>';
  $("dt").onclick=function(){
    $("demo").scrollIntoView({
      behavior:"smooth"
    });
    setTimeout(function(){
      if(E[c[0]])run(c[0]);else msg(1,"MD Bot","<div>O comando <b>/"+c[0]+"</b> ainda não está na demo, mas faz parte do plano do projeto.</div>",["think"])
    },600)
  }
}
function rd(){
  var q=$("dq").value.toLowerCase(),o=$("dl2");
  o.innerHTML="";
  var f=DC.filter(function(c){
    return(dcat=="Todos"||c[1]==dcat)&&(c[0]+c[3]).toLowerCase().indexOf(q)>-1
  });
  f.forEach(function(c){
    var b=document.createElement("button");b.className="dr";b.innerHTML="<b>/"+c[0]+"</b><small>"+c[1]+"</small>";b.onclick=function(){
      sd(c)
    };o.appendChild(b)
  });
  if(!f.length)o.innerHTML='<p class="lead">Nenhum comando encontrado.</p>'
}
["Todos","Moderação","Economia","Recompensas","Cargos","Utilidades"].forEach(function(n){
  var b=document.createElement("button");b.className="opt"+(n==dcat?" on":"");b.textContent=n;b.onclick=function(){
    dcat=n;[].forEach.call($("df").children,function(x){
      x.classList.toggle("on",x==b)
    });rd()
  };$("df").appendChild(b)
});
$("dq").oninput=rd;
rd();
sd(DC[0]);
[["how","wave","É simples: convida, configura e relaxa."],
["compare","point","Quantos bots você usa hoje? Mexe no controle!"],
["quiz","think","Me conta que tipo de servidor você tem."],
["docs","stand","Aqui estão os comandos planejados. Busque à vontade."]].forEach(function(s){
  var el=$(s[0]);el._s=[0,s[1],function(){
    return s[2]
  }];so.observe(el)
});
[["think","Essa é a ideia: um bot só."],
["wave","Eu sou da MaisterDev Company."],
["scared","Calma, ainda estou em desenvolvimento!"]].forEach(function(a,i){
  var d=document.querySelectorAll("#faq details")[i];if(d)d.ontoggle=function(){
    if(d.open)say(a[0],a[1],3500)
  }
});
var idl;
function aw(){
  if(gi.src==I.sleep&&!window.MU){
    gi.src=I.stand;
    say("wave","Acordei! O que vamos fazer?",2500)
  }
  clearTimeout(idl);
  idl=setTimeout(function(){
    if(!window.MU){
      say("sleep","Zzz... Me chama se precisar.",5000)
    }
  },45000)
}
["pointerdown","keydown","scroll","touchstart"].forEach(function(e){
  addEventListener(e,aw,{
    passive:true
  })
});
aw();
var PB="img/banner.webp",ST={
  cmd:0,msg:0,coins:1850,dup:0,claimed:0
},CUR="comandos",STORE={},RP=null,ACT='<div class="ac"><button data-a="r">Reagir</button><button data-a="p">Responder</button></div>',MEM={
  m1:["Lia","Moderadora (exemplo)"],m2:["Davi","Membro (exemplo)"]
};
function rxh(rx){
  if(!rx)return"";
  return'<div class="rx">'+rx.map(function(k,i){
    return'<span class="rp" data-k="'+k+'" data-n="'+(i+2)+'"><img src="'+I[k]+'" alt=""><b>'+(i+2)+"</b></span>"
  }).join("")+"</div>"
}
function addRx(m,k){
  var c=m.children[1],r=c.querySelector(".rx");
  if(!r){
    r=document.createElement("div");
    r.className="rx";
    c.appendChild(r)
  }
  var p=r.querySelector('[data-k="'+k+'"]');
  if(p){
    if(!p.classList.contains("on")){
      p.classList.add("on");
      p.querySelector("b").textContent=+p.dataset.n+1
    }
  }else{
    p=document.createElement("span");
    p.className="rp on";
    p.dataset.k=k;
    p.dataset.n=0;
    p.innerHTML='<img src="'+I[k]+'" alt=""><b>1</b>';
    r.appendChild(p)
  }
  var pk=c.querySelector(".pk2");
  if(pk)pk.remove()
}
var msg0=msg;
msg=function(bot,name,html,rx){
  if(!bot&&RP){
    html='<div class="rpy">Respondendo a <b>'+esc(RP.n)+"</b>: "+esc(RP.t)+"</div>"+html;
    RP=null;
    $("rb").style.display="none"
  }
  if(!bot)ST.msg++;
  return msg0(bot,name,html,rx)
};
var rb=document.createElement("div");
rb.id="rb";
rb.className="rb";
rb.innerHTML='<span id="rt"></span><button id="rx2" aria-label="Cancelar resposta">×</button>';
mnE.insertBefore(rb,cmpE);
$("rx2").onclick=function(){
  RP=null;
  rb.style.display="none"
};
function showReply(){
  $("rt").innerHTML="Respondendo a <b>"+esc(RP.n)+"</b>";
  rb.style.display="flex";
  fi.focus()
}
ms.addEventListener("click",function(e){
  var t=e.target,u=t.closest("[data-u]");if(u){
    openPf(u.dataset.u);return
  }
  var x=t.closest("[data-a]"),m=t.closest(".m");if(!m)return;if(x){
    var a=x.dataset.a;if(a=="p"){
      var c=m.children[1].cloneNode(true),n=c.querySelector(".nm"),nn=n.firstChild.textContent;n.remove();var q=c.querySelector(".pk2");if(q)q.remove();RP={
        n:nn,t:c.textContent.replace(/\s+/g," ").trim().slice(0,50)
      };showReply();m.classList.remove("sel")
    }else if(a=="r"){
      var pk=m.querySelector(".pk2");if(pk)pk.remove();else{
        pk=document.createElement("div");pk.className="pk2";pk.innerHTML=RL.slice(0,8).map(function(r){
          return'<button data-a="x" data-k="'+r[0]+'" title="'+r[1]+'"><img src="'+I[r[0]]+'" alt=""></button>'
        }).join("");m.children[1].appendChild(pk)
      }
    }else if(a=="x")addRx(m,x.dataset.k);return
  }
  if(t.closest(".bs,.rp,.pk2"))return;var s=m.classList.contains("sel");ms.querySelectorAll(".m.sel").forEach(function(y){
    y.classList.remove("sel")
  });if(!s)m.classList.add("sel")
});
var pfm=document.createElement("div");
pfm.id="pfm";
document.body.appendChild(pfm);
function pfx(){
  pfm.className=""
}
pfm.onclick=function(e){
  if(e.target==pfm)pfx()
};
addEventListener("keydown",function(e){
  if(e.key=="Escape")pfx()
});
function openPf(w,tab){
  tab=tab||0;
  var bot=w=="bot",g=MEM[w],nm=bot?"MD Bot":g?g[0]:(UN||"Visitante"),T=bot?["Perfil","Comandos","Módulos"]:w=="user"?["Perfil","Atividade"]:["Perfil"],b="",bt="",lv=1+Math.floor((ST.cmd*50+ST.msg*20)/100);
  if(bot){
    if(tab==0)b="<h4>Sobre mim</h4><p>Automação, poder, Discord. Tudo o que o seu servidor precisa, em um bot só.</p><h4>Criado por</h4><p>MaisterDev Company</p><h4>Status</h4><p>Online na demonstração. Em desenvolvimento.</p>";
    if(tab==1)b='<div class="pcm">'+Object.keys(E).map(function(k){
      return'<button data-c="'+k+'">/'+k+"</button>"
    }).join("")+"</div>";
    if(tab==2)b=[["Moderação","#da373c"],
    ["Economia","#f0b232"],
    ["Cargos","#5865f2"],
    ["Recompensas","#16ff3c"],
    ["Utilidades","#8a1cff"],
    ["IA e integrações","#b9aed6"]].map(function(x){
      return'<span class="pch"><i style="background:'+x[1]+'"></i>'+x[0]+"</span>"
    }).join("");
    bt='<button id="b1">Enviar mensagem</button><button id="b2" class="g">Ver documentação</button><button id="b3" class="g">Lista de espera</button>'
  } else if(w=="user"){
    if(tab==0)b='<h4>Sobre</h4><p>Visitante do site do MD Bot.</p><h4>Cargos</h4><span class="pch"><i style="background:#16ff3c"></i>Visitante</span>';
    else b='<div class="pst"><div><b>'+ST.cmd+"</b>comandos</div><div><b>"+ST.msg+"</b>mensagens</div><div><b>"+ST.coins+"</b>MD Coins</div></div><h4>Nível</h4><p>Nível "+lv+"</p>";
    bt='<button id="b4">Resgatar daily</button>'
  } else b="<h4>Sobre</h4><p>"+g[1]+". Perfil de exemplo da demonstração.</p>";
  var av=bot?"background:#1a1128 url("+I.stand+") 50% 4%/260% no-repeat":w=="user"?"":"background:#404249";
  pfm.innerHTML='<div class="pc"><div class="pbn"'+(bot?' style="background-image:url('+PB+')"':"")+'></div><button class="px" id="pcx" aria-label="Fechar">×</button><div class="pav" style="'+av+'">'+(bot?"":nm[0])+'<i></i></div><div class="pbd"><h3>'+esc(nm)+(bot?' <span class="app">APP</span>':"")+"</h3><small>"+(bot?"mdbot":w=="user"?"visitante":"membro")+'</small><div class="ptb">'+T.map(function(x,i){
    return'<button data-t="'+i+'" class="'+(i==tab?"on":"")+'">'+x+"</button>"
  }).join("")+"</div><div>"+b+'</div><div class="pbt">'+bt+"</div></div></div>";
  pfm.className="on";
  $("pcx").onclick=pfx;
  [].forEach.call(pfm.querySelectorAll("[data-t]"),function(x){
    x.onclick=function(){
      openPf(w,+x.dataset.t)
    }
  });
  [].forEach.call(pfm.querySelectorAll("[data-c]"),function(x){
    x.onclick=function(){
      pfx();cmd(x.dataset.c)
    }
  });
  if(bot){
    $("b1").onclick=function(){
      pfx();
      goCh("comandos");
      fi.value="/ajuda";
      fi.focus()
    };
    $("b2").onclick=function(){
      pfx();
      $("docs").scrollIntoView({
        behavior:"smooth"
      })
    };
    $("b3").onclick=function(){
      pfx();
      om()
    }
  }
  if(w=="user")$("b4").onclick=function(){
    pfx();
    cmd("daily")
  }
}
var mbp=document.createElement("div");
mbp.className="mbp";
mbp.innerHTML='<h5>Online — 3</h5><div data-u="bot"><span class="av bt2" data-n=""></span><span>MD Bot</span><span class="app">APP</span></div><div data-u="user"><span class="av">V</span><span>Você</span></div><div data-u="m1"><span class="av" style="background:#404249">L</span><span>Lia</span></div>';
document.querySelector(".dc").appendChild(mbp);
mbp.onclick=function(e){
  var d=e.target.closest("[data-u]");
  if(d)openPf(d.dataset.u)
};
function upMb(){
  var u=mbp.querySelector('[data-u="user"]');
  u.children[0].textContent=(UN||"Você")[0];
  u.children[1].textContent=UN||"Você"
}
function seed(u,n,bot,h){
  return'<div class="m"><div class="av'+(bot?" bt2":"")+'" data-u="'+u+'"'+(u=="m1"?' style="background:#404249"':"")+">"+(bot?"":n[0])+'</div><div><span class="nm" data-u="'+u+'">'+n+(bot?'<span class="app">APP</span>':"")+"<small>hoje</small></span>"+h+"</div>"+ACT+"</div>"
}
var SEED={
  regras:'<div class="sys">Início do canal #regras.</div>'+seed("bot","MD Bot",1,'<div class="emb" style="--c:#8a1cff"><h4>Regras do servidor</h4><p>1. Respeite todos os membros.<br>2. Sem spam ou divulgação não autorizada.<br>3. Siga as orientações da moderação.</p></div><div class="bs"><span class="g">Aceitar regras</span></div>'),geral:'<div class="sys">Início do canal #geral.</div>'+seed("m1","Lia",0,"<div>Alguém já testou o /daily?</div>")+seed("m2","Davi",0,"<div>Já! Caíram 500 moedas.</div>")+seed("bot","MD Bot",1,'<div>Resgate o seu com <b>/daily</b> no canal #comandos.</div>'),loja:'<div class="sys">Início do canal #loja.</div>'+seed("bot","MD Bot",1,'<div class="emb" style="--c:#f0b232"><h4>Loja do servidor</h4><div class="fd"><div><b>Cargo VIP</b>5.000</div><div><b>Cor roxa</b>1.200</div></div></div><div class="bs"><span class="g">Comprar VIP</span><span>Cor roxa</span></div>')
};
function clr(){
  ms.innerHTML='<div class="sys">Início do canal #'+CUR+'. Toque num comando abaixo ou digite / para ver a lista.</div>';
  jm.className="jmp"
}
var CHN=["regras","comandos","geral","loja"],chb=document.createElement("div");
chb.className="chb";
CHN.forEach(function(n){
  var b=document.createElement("button");b.textContent="# "+n;b.dataset.n=n;chb.appendChild(b)
});
document.querySelector(".mh").after(chb);
function goCh(n){
  if(n==CUR)return;
  STORE[CUR]=ms.innerHTML;
  CUR=n;
  ms.innerHTML=STORE[n]||SEED[n]||"";
  document.querySelector(".mh span").textContent="# "+n;
  [].forEach.call(document.querySelectorAll(".cl div"),function(d,i){
    d.classList.toggle("on",CHN[i]==n)
  });
  [].forEach.call(chb.children,function(b){
    b.classList.toggle("on",b.dataset.n==n)
  });
  fi.disabled=n=="regras";
  fi.placeholder=n=="regras"?"Você não tem permissão para enviar mensagens neste canal.":"Digite /comando ou pergunte algo. Ex.: /ban @fulano spam";
  rb.style.display="none";
  RP=null;
  ms.scrollTop=ms.scrollHeight;
  jm.className="jmp"
}
[].forEach.call(document.querySelectorAll(".cl div"),function(d,i){
  d.onclick=function(){
    goCh(CHN[i])
  }
});
chb.onclick=function(e){
  if(e.target.dataset.n)goCh(e.target.dataset.n)
};
chb.children[1].classList.add("on");
fi.placeholder="Digite /comando ou pergunte algo. Ex.: /ban @fulano spam";
Object.defineProperty(E,"daily",{
  enumerable:true,configurable:true,get:function(){
    return["/daily",ST.dup?'<div class="emb" style="--c:#da373c"><h4>Daily já resgatado</h4><p>Volte amanhã para resgatar de novo.</p></div>':'<div class="emb" style="--c:#f0b232"><h4>Recompensa diária</h4><p>Você recebeu <b>+500 MD Coins</b>. Volte amanhã!</p><img class="t" src="'+I.coin+'"><div class="fd"><div><b>Saldo</b>'+ST.coins+"</div><div><b>Sequência</b>7 dias</div></div></div>"]
  }
});
Object.defineProperty(E,"saldo",{
  enumerable:true,configurable:true,get:function(){
    return["/saldo",'<div class="emb" style="--c:#f0b232"><h4>Seu saldo</h4><p><b>'+ST.coins+"</b> MD Coins</p><img class=\"t\" src=\""+I.coin+'"></div>']
  }
});
Object.defineProperty(E,"rank",{
  enumerable:true,configurable:true,get:function(){
    var x=ST.cmd*50+ST.msg*20;return["/rank",'<div class="emb" style="--c:#16ff3c"><h4>Seu nível: '+(1+Math.floor(x/100))+'</h4><p>'+(x%100)+" / 100 XP</p><div class=\"pb\"><i style=\"width:"+(x%100)+'%"></i></div></div>']
  }
});
RX.saldo=["coin"];
PD.saldo="Mostra suas MD Coins";
var run1=run;
run=function(k){
  if(CUR=="regras")goCh("comandos");
  if(k=="daily"&&!busy){
    ST.dup=ST.claimed;
    ST.claimed=1;
    if(!ST.dup)ST.coins+=500
  }
  if(!busy)ST.cmd++;
  return run1(k)
};
function cmd(k){
  if(k=="limpar"){
    clr();
    return
  }
  run(k)
}
$("ch").innerHTML="";
Object.keys(E).concat(["limpar"]).forEach(function(k){
  var b=document.createElement("button");b.textContent="/"+k;b.onclick=function(){
    cmd(k)
  };$("ch").appendChild(b)
});
async function argRun(k,a){
  busy=1;
  ST.cmd++;
  msg(0,UN||"Você",'<div class="cmdl">usou <span>/'+k+"</span> "+esc(a)+"</div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(900);
  $("ty").textContent="";
  var h;
  if(k=="ban"){
    var p=a.split(/\s+/);
    h='<div class="emb" style="--c:#8a1cff"><h4>Membro banido</h4><p><b>'+esc(p[0].replace(/^@/,""))+"</b> foi banido. Motivo: "+esc(p.slice(1).join(" ")||"sem motivo informado")+'.</p><img class="t" src="'+I.ban+'"><div class="fd"><div><b>Moderador</b>'+esc(UN||"Você")+"</div><div><b>Caso</b>#"+(100+ST.cmd)+'</div></div></div><div class="bs"><span class="r">Desfazer</span><span>Ver log</span></div>'
  }else if(k=="enquete")h='<div class="emb" style="--c:#8a1cff"><h4>Enquete</h4><p>'+esc(a)+'</p></div><div class="bs"><span>Sim</span><span>Não</span></div>';
  else h='<div class="emb" style="--c:#f0b232"><h4>Sorteio ativo</h4><p>Prêmio: <b>'+esc(a)+'</b>. Termina em 24 horas.</p><img class="t" src="'+I.coin+'"></div><div class="bs"><span class="g">Participar</span></div>';
  msg(1,"MD Bot",h,RX[k]);
  busy=0;
  say(k=="ban"?"angry":"cheer",k=="ban"?"Banido com sucesso.":"Feito!",2500)
}
async function send(){
  if(busy||fi.disabled)return;
  var v=fi.value.trim();
  if(!v)return;
  hp();
  var m=v.match(/^\/(\S+)\s*(.*)$/),k=m?m[1].toLowerCase():"",a=m?m[2].trim():"";
  if(m&&(k=="limpar"||E[k])){
    fi.value="";
    if(a&&(k=="ban"||k=="enquete"||k=="sorteio")){
      await argRun(k,a)
    }else cmd(k);
    return
  }
  fi.value="";
  busy=1;
  msg(0,UN||"Você","<div>"+esc(v)+"</div>");
  $("ty").textContent="MD Bot está digitando...";
  await sl(900);
  $("ty").textContent="";
  msg(1,"MD Bot","<div>"+(m?"Comando desconhecido. Digite / para ver a lista.":rep(v))+"</div>",[m?"scared":"think"]);
  busy=0
}
PD.saldo="Mostra suas MD Coins";
function intro(){
  var sv="",o=document.createElement("div"),done=0;
  try{
    sv=localStorage.getItem("mdname")||""
  }catch(e){}o.id="in";
  o.innerHTML='<button class="sk" id="isk">Pular</button><div class="ms2" id="im"><img id="ii" alt=""></div><div class="dlg" id="id"></div><div class="ich" id="ic"></div>';
  document.body.appendChild(o);
  document.body.style.overflow="hidden";
  var ii=$("ii"),dd=$("id"),ic=$("ic");
  function pz(k){
    ii.src=I[k];
    ii.classList.remove("jp");
    void ii.offsetWidth;
    ii.classList.add("jp")
  }
  function fin(g){
    if(done)return;
    done=1;
    o.classList.add("off");
    document.body.style.overflow="";
    upMb();
    setTimeout(function(){
      o.remove();if(g){
        var t=document.getElementById(g);if(t)t.scrollIntoView({
          behavior:"smooth"
        })
      }
      if(window.openNews)openNews(true);
      say(UN?"love":"wave",UN?"Me chama quando precisar, "+UN+".":"Se precisar, é só clicar em mim.",4000)
    },650)
  }
  function talk(t,p){
    pz(p);
    dd.innerHTML='<span class="dt"><i></i><i></i><i></i></span>';
    ic.innerHTML="";
    return new Promise(function(r){
      setTimeout(function(){
        if(done)return;dd.textContent="";var k=0,iv=setInterval(function(){
          dd.textContent=t.slice(0,++k);if(k>=t.length){
            clearInterval(iv);r()
          }
        },24)
      },650)
    })
  }
  function opts(a){
    return new Promise(function(r){
      ic.innerHTML="";a.forEach(function(x,i){
        var b=document.createElement("button");b.className="opt";b.style.animationDelay=i*80+"ms";b.textContent=x[0];b.onclick=function(){
          r(x[1])
        };ic.appendChild(b)
      })
    })
  }
  function nameQ(){
    return new Promise(function(r){
      ic.innerHTML='<input id="iu" maxlength="14" placeholder="Seu nome" autocomplete="given-name" aria-label="Seu nome"><button class="opt" id="ig">Continuar</button><button class="opt" id="in2">Prefiro não dizer</button>';var G=ic.querySelector("#ig"),U=ic.querySelector("#iu"),N=ic.querySelector("#in2");G.onclick=function(){
        var v=U.value.trim();if(v)r(v)
      };U.onkeydown=function(e){
        if(e.key=="Enter"&&this.value.trim())r(this.value.trim())
      };N.onclick=function(){
        r("")
      }
    })
  }
  $("isk").onclick=function(){
    fin()
  };
  $("im").onclick=function(){
    var L=["angry","lol","scared","point","love","cheer"];
    pz(L[Math.floor(Math.random()*6)]);
    dd.textContent=["Ei, cuidado com o cliquezinho!","Kkk, isso faz cócegas.","Calma! Eu ainda estou carregando.","Quer parar de me cutucar?"][Math.floor(Math.random()*4)]
  };
  (async function(){
    if(sv){
      UN=sv;await talk("Bem-vindo de volta, "+sv+"!","love")
    }else{
      await talk("E aí! Eu sou o MD, o bot da MaisterDev Company.","wave");await talk("Antes de começar: como posso te chamar?","think");var n=await nameQ();if(n){
        UN=n;try{
          localStorage.setItem("mdname",n)
        }catch(e){}await talk("Prazer, "+n+"!","love")
      }else await talk("Sem problema, serei discreto.","stand")
    }
    await talk("O que você veio fazer por aqui?","point");var c=await opts([["Conhecer o bot","demo"],["Ver os comandos","docs"],["Montar meu servidor","quiz"],["Só dar uma olhada","studio"]]),R2={
      demo:["cheer","Boa! Vou te levar para a demonstração do Discord."],docs:["think","Show! A biblioteca de comandos fica logo ali."],quiz:["love","Perfeito! Vamos descobrir quais módulos combinam com o seu servidor."],studio:["lol","Então bora brincar: crie uma reação minha no Studio."]
    };await talk(R2[c][1],R2[c][0]);await talk("Só um aviso: ainda estou em desenvolvimento, então isto aqui é uma prévia.","scared");var g=await opts([["Entrar no site",c]]);fin(g)
  })()
}
var it=setInterval(function(){
  if(!$("ld")){
    clearInterval(it);intro()
  }
},120);
var DISCORD=MDBOT_CONFIG.DISCORD_URL,WL_EMAIL=MDBOT_CONFIG.WAITLIST_EMAIL,WL_FORM=MDBOT_CONFIG.WAITLIST_FORM;
function toast(t){
  var d=document.createElement("div");
  d.className="tst2";
  d.textContent=t;
  document.body.appendChild(d);
  setTimeout(function(){
    d.classList.add("on")
  },20);
  setTimeout(function(){
    d.remove()
  },3200)
}
function bindCom(r){
  (r||document).querySelectorAll(".comlink").forEach(function(a){
    if(DISCORD){
      a.href=DISCORD;a.target="_blank";a.rel="noopener noreferrer"
    }else{
      a.href="#";a.onclick=function(e){
        e.preventDefault();toast("O convite da comunidade será liberado em breve.")
      }
    }
  })
}
var SP=[["wave","1","Adicione ao servidor","Quando o MD Bot for lançado, colocá-lo no seu servidor leva poucos cliques.",["dis","Adicionar ao servidor","EM BREVE"]],
["cheer","2","Entre na comunidade oficial","Acompanhe novidades, envie sugestões e converse com a equipe da MaisterDev Company no Discord.",["com","Entrar na comunidade",""]],
["think","3","Configure e automatize","Ligue os módulos que combinam com a sua comunidade pelo painel web e deixe o resto com o MD.",["dis","Abrir painel","EM DESENV."]]];
$("hw").innerHTML="";
SP.forEach(function(s){
  var d=document.createElement("div"),b=s[4];d.className="sp";d.innerHTML='<span class="sn">'+s[1]+'</span><img src="'+I[s[0]]+'" alt=""><h3>'+s[2]+"</h3><p>"+s[3]+"</p>"+(b[0]=="dis"?'<button class="bt dis" disabled aria-disabled="true" title="Disponível no lançamento">'+b[1]+(b[2]?'<span class="chip">'+b[2]+"</span>":"")+"</button>":'<a class="bt comlink" href="#">'+b[1]+"</a>");$("hw").appendChild(d)
});
md.innerHTML='<div class="am wl"><button class="px2" id="cx" aria-label="Fechar">×</button><div id="wlf"><div class="amh"><img src="'+I.love+'" alt=""><div><span class="tag">Acesso antecipado</span><h3>Quero acesso ao MD Bot</h3><p>O bot ainda está em desenvolvimento. Cadastre-se e a MaisterDev Company avisa quando o acesso for liberado.</p></div></div><div class="ami"><div><b>5</b><span>módulos planejados</span></div><div><b>1</b><span>painel web</span></div><div><b>0</b><span>bots extras</span></div></div><input type="text" name="website" id="wh" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0"><label>Nome</label><input type="text" id="wn" maxlength="60" autocomplete="name"><label>E-mail</label><input type="email" id="em" maxlength="120" autocomplete="email"><label>Seu servidor (opcional)</label><input type="text" id="sn" maxlength="60"><label>Usuário no Discord (opcional)</label><input type="text" id="wd" maxlength="40"><label class="ck"><input type="checkbox" id="wc"> Aceito ser contatado sobre o lançamento do MD Bot.</label><small id="er"></small><button class="bt" id="ok">Entrar na lista</button></div><div id="wls" style="display:none"></div></div>';
$("cx").onclick=cm;
function wlDone(r,sv){
  var mail=WL_EMAIL?"mailto:"+WL_EMAIL+"?subject="+encodeURIComponent("Lista de espera MD Bot")+"&body="+encodeURIComponent("Nome: "+r.nome+"\nE-mail: "+r.email+"\nServidor: "+r.servidor+"\nDiscord: "+r.discord):"",t=sv=="server"?"Cadastro registrado na lista de espera. Entraremos em contato.":"Cadastro guardado neste dispositivo."+(mail||WL_FORM?" Conclua o envio abaixo para a equipe receber os seus dados.":" A lista oficial da equipe ainda está sendo ativada. Entre na comunidade para não perder o lançamento.");
  $("wlf").style.display="none";
  var s=$("wls");
  s.style.display="block";
  s.innerHTML='<div class="amh"><img src="'+I.cheer+'" alt=""><div><span class="tag">Quase lá</span><h3>Obrigado, '+esc(r.nome.split(" ")[0])+'!</h3><p>'+t+'</p></div></div><div class="amb">'+(mail?'<a class="bt" href="'+mail+'">Enviar por e-mail</a>':"")+(WL_FORM?'<a class="bt" target="_blank" rel="noopener" href="'+WL_FORM+'">Concluir no formulário</a>':"")+'<a class="bt v comlink" href="#">Entrar na Comunidade</a><button class="bt" id="wlc">Fechar</button></div>';
  bindCom(s);
  $("wlc").onclick=cm;
  say("love","Anotado! Obrigado pelo interesse.",4000)
}
$("ok").onclick=async function(){
  var n=$("wn").value.trim(),e=$("em").value.trim().toLowerCase(),er=$("er"),b=this;
  er.style.color="#ff6b6b";
  if(n.length<2){
    er.textContent="Informe o seu nome.";
    return
  }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e)){
    er.textContent="Digite um e-mail válido.";
    return
  }
  if(!$("wc").checked){
    er.textContent="Aceite o contato para continuar.";
    return
  }
  var r={
    nome:n,email:e,servidor:$("sn").value.trim(),discord:$("wd").value.trim(),data:new Date().toISOString()
  },sv="local",L=[];
  b.disabled=true;
  er.style.color="#16ff3c";
  er.textContent="Enviando...";
  try{
    L=JSON.parse(localStorage.getItem("mdwl")||"[]")
  }catch(x){}if(!L.some(function(y){
    return y.email==e
  }))L.push(r);
  try{
    localStorage.setItem("mdwl",JSON.stringify(L))
  }catch(x){}try{
    var rs=await fetch(MDBOT_CONFIG.WAITLIST_ENDPOINT,{
      method:"POST",headers:{
        "Content-Type":"application/json"
      },body:JSON.stringify({
        nome:r.nome,email:r.email,servidor:r.servidor,discord:r.discord,consentimento:true,website:($("wh")||{}).value||""
      })
    });
    if(rs.ok)sv="server";
    else if(rs.status==429){
      b.disabled=false;
      er.style.color="#ff6b6b";
      er.textContent="Muitas tentativas. Tente novamente mais tarde.";
      return
    }
  }catch(x){}b.disabled=false;
  wlDone(r,sv)
};
om=function(e){
  if(e&&e.preventDefault)e.preventDefault();
  $("wlf").style.display="block";
  $("wls").style.display="none";
  $("er").textContent="";
  md.classList.add("on")
};
$("nvb").onclick=om;
$("ct").onclick=om;
$("mw").onclick=function(e){
  om(e)
};
$("hadd").onclick=om;
var FQ=[["Geral","O que é o MD Bot?","Um bot multifuncional de Discord criado pela MaisterDev Company para centralizar moderação, cargos, economia, recompensas e utilidades em uma única plataforma.","wave","Eu sou o MD, prazer!"],
["Geral","O MD Bot substitui outros bots?","Essa é a proposta: reunir as ferramentas mais usadas para que você dependa de menos bots e gerencie tudo em um lugar só.","think","Menos bots, menos dor de cabeça."],
["Geral","Quem desenvolve o projeto?","O MD Bot é desenvolvido pela MaisterDev Company.","stand","Feito pela MaisterDev Company."],
["Produto","Quais módulos o bot terá?","Moderação avançada, cargos e permissões, economia virtual, recompensas, utilidades e integrações.","cheer","Muita coisa boa vindo aí!"],
["Produto","Vai ter painel web?","Sim. O painel web faz parte do projeto e permitirá configurar o bot sem digitar comandos. Ele está em desenvolvimento.","point","Painel na veia!"],
["Produto","Vai ter inteligência artificial?","IA e integrações estão no plano do projeto. Os detalhes serão divulgados conforme o desenvolvimento avançar.","think","Hmm... segredo por enquanto."],
["Lançamento","Já posso adicionar o bot ao meu servidor?","Ainda não. O MD Bot está em desenvolvimento e não é público. Entre na lista de espera ou na comunidade para acompanhar.","scared","Calma, ainda estou em obras!"],
["Lançamento","Como serei avisado do lançamento?","Entre na lista de espera e acompanhe a comunidade oficial no Discord.","wave","Eu aviso você!"],
["Lançamento","Vai ser gratuito?","Os planos ainda estão em definição. Novidades serão divulgadas na comunidade.","think","Ainda estamos decidindo."],
["Comunidade","Como entro na comunidade oficial?","Pelo botão Entrar na Comunidade, aqui no site.","cheer","Te espero lá!"],
["Comunidade","Posso sugerir recursos?","Sim! Sugestões são bem-vindas na comunidade e ajudam a priorizar o que será desenvolvido.","love","Adoro sugestões!"],
["Comunidade","Encontrei um problema. E agora?","Conte na comunidade com o máximo de detalhes possível para a equipe investigar.","angry","Bug? Me conta que a gente resolve."]],fcat="Todas";
var fqs=document.createElement("section");
fqs.id="faq";
fqs.className="rv";
fqs.innerHTML='<span class="tag">Central de dúvidas</span><h2>Perguntas <b>frequentes</b></h2><p class="lead">Busque ou filtre. O MD responde com uma reação.</p><input id="fqs" class="sq" placeholder="Buscar dúvida" aria-label="Buscar dúvida"><div class="opts" id="fqc"></div><div class="fq"><div id="fqa"></div><aside class="fqs"><img id="fqi" alt=""><div><p id="fqt">Escolha uma pergunta e eu respondo.</p><a class="bt v comlink" href="#">Falar na comunidade</a></div></aside></div>';
function fr(){
  var q=$("fqs").value.toLowerCase(),o=$("fqa"),n=0;
  o.innerHTML="";
  FQ.forEach(function(f){
    if(!(fcat=="Todas"||f[0]==fcat)||(f[1]+f[2]).toLowerCase().indexOf(q)<0)return;n++;var d=document.createElement("div");d.className="fqi";d.innerHTML='<button class="fqq" aria-expanded="false"><b>'+(n<10?"0":"")+n+"</b><span>"+f[1]+'</span><i></i></button><div class="fqa"><p>'+f[2]+"</p></div>";var bt=d.firstChild,an=d.lastChild;bt.onclick=function(){
      var op=d.classList.contains("on");[].forEach.call(o.children,function(x){
        x.classList.remove("on");x.lastChild.style.maxHeight="0";x.firstChild.setAttribute("aria-expanded","false")
      });if(!op){
        d.classList.add("on");an.style.maxHeight=an.scrollHeight+30+"px";bt.setAttribute("aria-expanded","true");$("fqi").src=I[f[3]];$("fqt").textContent=f[4]
      }
    };o.appendChild(d)
  });
  if(!n){
    o.innerHTML='<p class="lead">Nenhuma dúvida encontrada. Pergunte na comunidade!</p>';
    $("fqi").src=I.scared
  }
}
var old=$("faq");
old.parentNode.replaceChild(fqs,old);
io.observe(fqs);
so.observe(fqs);
fqs._s=[0,"think",function(){
  return"Ficou com dúvida, "+nm()+"? Abre aí."
}];
$("fqi").src=I.wave;
["Todas","Geral","Produto","Lançamento","Comunidade"].forEach(function(n){
  var b=document.createElement("button");b.className="opt"+(n==fcat?" on":"");b.textContent=n;b.onclick=function(){
    fcat=n;[].forEach.call($("fqc").children,function(x){
      x.classList.toggle("on",x==b)
    });fr()
  };$("fqc").appendChild(b)
});
$("fqs").oninput=fr;
fr();
bindCom();
(function(){
  var q=[I.wave,I.think,I.point,I.angry,I.cheer],k=0,m=$("ldm");if(!m)return;m.src=q[0];var iv=setInterval(function(){
    if(!$("ldm")){
      clearInterval(iv);return
    }
    var p=parseInt($("lp").textContent)||0;k=p>92?4:(k+1)%4;m.src=q[k]
  },420)
})();
