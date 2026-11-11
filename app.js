/* ENCRENCA! · Fichas — extensão para o Owlbear Rodeo.
 * Cada jogador edita a própria ficha; o mestre vê e edita todas.
 * As fichas ficam nos metadados da sala (um item por jogador). */
(function () {
  "use strict";

  // Alguns empacotamentos do SDK expõem o objeto em OBR.default
  if (window.OBR && window.OBR.default && !window.OBR.onReady) window.OBR = window.OBR.default;

  var PREFIXO = "com.encrenca.ficha/";
  var CANAL = "com.encrenca.ficha.rolagem";
  var LIMITE_SALA = 16000; // limite de metadados da sala (compartilhado com outras extensões)
  var ATRS = [["musculo", "Músculo"], ["reflexo", "Reflexo"], ["miolo", "Miolo"], ["labia", "Lábia"]];
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/dist/obr.min.js";
  var SDK_URL_RESERVA = "https://unpkg.com/@owlbear-rodeo/sdk@3.1.0/dist/obr.min.js";

  /* ---------- dados do sistema (do PDF Encrenca! RPG de Bolso) ---------- */
  var CLASSES = {
    "Briguento": { vida: 12, pm: 0, pericias: "Lutar, Aguentar, Intimidar",
      equip: "1 arma pesada (d8), armadura média (+2) ou escudo (+1), 1 Tralha",
      talento: "Pancada Boa: 1 vez por cena, um ataque seu causa dano dobrado." },
    "Larápio": { vida: 8, pm: 0, pericias: "Furtar, Esgueirar, Arrombar",
      equip: "2 adagas (d4), armadura leve (+1), gazua, 2 Tralhas",
      talento: "Golpe Sujo: contra alvo distraído ou surpreso, seu ataque causa +1d6 de dano." },
    "Arcano": { vida: 6, pm: 4, pericias: "Estudar, Alquimia, Arcanismo",
      equip: "Cajado (d4), grimório de bolso, 2 Tralhas",
      talento: "Magia Básica: conhece 3 magias do Grimório marcadas com A." },
    "Devoto": { vida: 9, pm: 3, pericias: "Curar, Rezar, Persuadir",
      equip: "Maça (d6), armadura média (+2), símbolo sagrado, 1 Tralha",
      talento: "Mãos Santas: 1 vez por cena, cura 1d6 de Vida ao toque, sem gastar PM. Conhece 2 magias com D." },
    "Rastreador": { vida: 8, pm: 2, pericias: "Rastrear, Sobreviver, Mirar",
      equip: "Arco curto (d6), armadura leve (+1), 1 Tralha",
      talento: "Parceiro Peludo: um bichinho (4 de Vida) dá vantagem em 1 teste seu por cena. Conhece 2 magias com R." },
    "Farsante": { vida: 7, pm: 2, pericias: "Enganar, Atuar, Tocar",
      equip: "Espada curta (d6), instrumento musical, 2 Tralhas",
      talento: "Inspiração: 1 vez por cena, dá vantagem a um aliado em qualquer teste. Conhece 2 magias com F (Lábia)." },
    "Selvagem": { vida: 14, pm: 0, pericias: "Lutar, Escalar, Intimidar",
      equip: "Machado de duas mãos (d10), peles (+1), 1 Tralha",
      talento: "Fúria: 1 vez por cena, por 1 minuto: +1 degrau no dano corpo a corpo, mas -1 para se defender." },
    "Alquimista": { vida: 7, pm: 2, pericias: "Alquimia, Estudar, Consertar",
      equip: "3 frascos, bandoleira, adaga (d4), 2 Tralhas",
      talento: "Frascos de Bolso: por descanso, prepara 3 frascos: Cura (1d6), Bomba (1d6 de fogo, Reflexo Dif. 5 para metade) ou Fumaça." },
    "Monge Maluco": { vida: 10, pm: 2, pericias: "Lutar, Equilibrar, Meditar",
      equip: "Faixa, bastão de bambu (d4), 1 Tralha",
      talento: "Punhos de Aço: desarmado causa d6 usando Reflexo. 1 vez por cena, faz 2 ataques numa ação. (PM = Ki)" },
    "Cavaleiro": { vida: 12, pm: 1, pericias: "Lutar, Cavalgar, Persuadir",
      equip: "Espada (d6), escudo (+1), cota de malha (+2), 1 Tralha",
      talento: "Juramento: escolha um aliado: 1 vez por cena, receba o dano que ele receberia. (PM = Fé)" },
    "Necromante": { vida: 6, pm: 4, pericias: "Estudar, Ocultismo, Intimidar",
      equip: "Cajado com caveira (d4), grimório negro, 1 Tralha",
      talento: "Levantar Esqueleto: 1 vez por cena, ergue 1 esqueleto (Vida 4, Ataque 4, d4). Conhece 3 magias com A." },
    "Druida": { vida: 8, pm: 3, pericias: "Natureza, Curar, Falar com Bichos",
      equip: "Cajado (d4), foice (d6), 1 Tralha",
      talento: "Forma Animal: 1 vez por cena, vire um bicho pequeno por 1 minuto (+4 de Vida, ataque d6). Conhece 2 magias com R ou D." },
    "Pirata": { vida: 10, pm: 0, pericias: "Lutar, Navegar, Blefar",
      equip: "Sabre (d6), pistola (d6, distância), 2 Tralhas",
      talento: "Sorte de Pirata: 1 vez por cena, role de novo 1 dado de ataque." },
    "Engenheiro": { vida: 8, pm: 1, pericias: "Consertar, Inventar, Mecânica",
      equip: "Chave inglesa (d6), mochila de engenhocas, 2 Tralhas",
      talento: "Engenhoca do Dia: a cada descanso longo, invente 1 engenhoca (Tabela de Engenhocas, pág. 21). (PM = Vapor)" }
  };

  var RACAS = {
    "Humano": { bonus: "+1 em qualquer atributo", sorte: 3, vida: 0,
      traco: "Teimoso: começa cada sessão com 3 Pontos de Sorte em vez de 2." },
    "Anão": { bonus: "+1 em Músculo", sorte: 2, vida: 3,
      traco: "Casca Grossa: +3 de Vida e vantagem contra veneno e bebidas fortes." },
    "Elfo": { bonus: "+1 em Reflexo", sorte: 2, vida: 0,
      traco: "Olhos de Coruja: enxerga no escuro e tem vantagem em Miolo para perceber coisas." },
    "Orc": { bonus: "+1 em Músculo", sorte: 2, vida: 2,
      traco: "Fúria: +2 de Vida. 1 vez por cena, dobre o dado de dano de um ataque." },
    "Gnomo": { bonus: "+1 em Miolo", sorte: 2, vida: 0,
      traco: "Engenhoca: começa com 1 Tralha extra e tem vantagem para consertar ou inventar." },
    "Brejeiro": { bonus: "+1 em Lábia", sorte: 2, vida: 0,
      traco: "Pele Escorregadia: vantagem para escapar de agarrões e nadar; salta o dobro." },
    "Pequenino": { bonus: "+1 em Lábia", sorte: 2, vida: 0,
      traco: "Sortudo: 1 vez por sessão, repita um dado sem gastar PS." },
    "Felino": { bonus: "+1 em Reflexo", sorte: 2, vida: 0,
      traco: "Caindo de Pé: ignora dano de queda e, 1 vez por dia, repete um teste de Reflexo." },
    "Draconiano": { bonus: "+1 em Músculo", sorte: 2, vida: 0,
      traco: "Sopro de Fumaça: 1 vez por cena, 1d6 de dano em cone curto (Reflexo Dif. 5 para metade)." },
    "Ossudo": { bonus: "+1 em Miolo", sorte: 2, vida: 0,
      traco: "Ossos Duros: imune a veneno e sono; não come nem dorme; -1 de dano cortante." },
    "Pixie": { bonus: "+1 em Reflexo", sorte: 2, vida: -2,
      traco: "Asinhas: voa até 6 m por turno, mas começa com -2 de Vida." },
    "Pedrês": { bonus: "+1 em Músculo", sorte: 2, vida: 0,
      traco: "Pele de Pedra: +1 para se defender, mas desvantagem em Esgueirar e afunda na água." },
    "Fungoide": { bonus: "+1 em Miolo", sorte: 2, vida: 0,
      traco: "Esporos: 1 vez por cena, esporos dão desvantagem a quem estiver a 3 m." },
    "Diabrete": { bonus: "+1 em Lábia", sorte: 2, vida: 0,
      traco: "Fogo no Sangue: imune a fogo; 1 vez por dia, cospe uma chama de 1d6 à distância." }
  };

  /* ---------- estado ---------- */
  var S = {
    myId: "", myName: "", role: "PLAYER", roomId: "",
    meta: {}, sheets: {}, players: [], sel: "",
    aviso: "", modo: "normal", per: false, log: [],
    dirty: false, dirtyId: "", pendingRemote: false, tm: null
  };

  /* ---------- utilitários ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function getPath(o, p) { return p.split(".").reduce(function (x, k) { return x == null ? x : x[k]; }, o); }
  function setPath(o, p, v) {
    var ks = p.split("."), last = ks.pop();
    var alvo = ks.reduce(function (x, k) { return x[k]; }, o);
    alvo[last] = v;
  }
  function status(txt, erro) {
    var el = $("status");
    el.textContent = txt || "";
    el.className = erro ? "erro" : "";
  }
  function novaFicha(id, dono) {
    return {
      v: 1, id: id, dono: dono || "", nome: "", apelido: "", raca: "", classe: "", nivel: 1,
      a: { musculo: 0, reflexo: 0, miolo: 0, labia: 0 },
      vida: [0, 0], pm: [0, 0], sorte: 2, arm: 0, cobres: 0,
      per: "", equip: "", tal: "", mag: "", traco: "", notas: "", t: 0
    };
  }
  function normalizar(f, id) {
    var base = novaFicha(id, "");
    if (!f || typeof f !== "object") return base;
    Object.keys(base).forEach(function (k) { if (f[k] === undefined) f[k] = base[k]; });
    f.a = Object.assign({}, base.a, f.a || {});
    Object.keys(base.a).forEach(function (k) {
      var n = typeof f.a[k] === "number" ? f.a[k] : (/^d/.test(String(f.a[k])) ? 0 : parseInt(f.a[k], 10));
      f.a[k] = clamp(isNaN(n) ? 0 : n, -9, 20);
    });
    if (!Array.isArray(f.vida) || f.vida.length < 2) f.vida = [0, 0];
    if (!Array.isArray(f.pm) || f.pm.length < 2) f.pm = [0, 0];
    f.id = id;
    return f;
  }
  function fichasDaMeta(meta) {
    var out = {};
    Object.keys(meta || {}).forEach(function (k) {
      if (k.indexOf(PREFIXO) === 0) {
        var id = k.slice(PREFIXO.length);
        out[id] = normalizar(meta[k], id);
      }
    });
    return out;
  }
  function nomeDe(id) {
    var f = S.sheets[id];
    if (f && (f.nome || f.dono)) return f.nome || f.dono;
    if (id === S.myId) return S.myName || "Você";
    var p = S.players.filter(function (x) { return x.id === id; })[0];
    return p && p.name ? p.name : "Jogador";
  }
  function fichaAtual() { return S.sheets[S.sel] || null; }
  function podeEditar() { return S.sel === S.myId || S.role === "GM"; }
  function emFoco() {
    var a = document.activeElement;
    return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !!$("app").contains(a);
  }
  function avisar(msg) { S.aviso = msg || ""; }

  /* ---------- salvar / backup ---------- */
  function backupLocal(f) {
    try { localStorage.setItem("encrenca-ficha:" + S.roomId + ":" + f.id, JSON.stringify(f)); } catch (e) { /* ok */ }
  }
  function lerBackup(id) {
    try {
      var s = localStorage.getItem("encrenca-ficha:" + S.roomId + ":" + id);
      return s ? normalizar(JSON.parse(s), id) : null;
    } catch (e) { return null; }
  }
  function salvar() {
    clearTimeout(S.tm);
    var id = S.dirtyId, f = S.sheets[id];
    if (!id || !f) { S.dirty = false; return Promise.resolve(); }
    f.t = Date.now();
    var upd = {};
    upd[PREFIXO + id] = f;
    S.dirty = false;
    return OBR.room.setMetadata(upd).then(function () {
      status("salvo ✓");
      backupLocal(f);
    }).catch(function () {
      S.dirty = true;
      status("não consegui salvar (limite de 16 kB da sala?)", true);
    });
  }
  function agendarSalvar() {
    S.dirty = true;
    S.dirtyId = S.sel;
    status("salvando…");
    clearTimeout(S.tm);
    S.tm = setTimeout(salvar, 500);
  }
  function editar(fn) {
    var f = fichaAtual();
    if (!f || !podeEditar()) return;
    fn(f);
    agendarSalvar();
    renderForm();
    renderResumo();
  }

  /* ---------- rolagens ---------- */
  function d20() { return 1 + Math.floor(Math.random() * 20); }
  function fazerTeste(modo, bonus, pericia) {
    var a = d20(), b = null, usado = a;
    if (modo !== "normal") {
      b = d20();
      usado = modo === "vantagem" ? Math.max(a, b) : Math.min(a, b);
    }
    return { a: a, b: b, usado: usado, total: usado + bonus + (pericia ? 2 : 0), nat1: usado === 1 };
  }
  function sinal(n) { return (n < 0 ? "-" : "+") + Math.abs(n); }
  function textoTeste(quem, rotulo, modo, bonus, pericia, t) {
    var s = quem + " · " + rotulo;
    if (modo !== "normal") s += " (" + modo + ": " + t.a + " e " + t.b + ")";
    s += ": " + t.usado + " " + sinal(bonus) + (pericia ? " +2 (perícia)" : "") + " = " + t.total;
    if (t.nat1) s += " — ENCRENCA! Natural 1: role na Tabela de Complicações";
    return s;
  }
  function registrarRolagem(texto, nat1, remoto) {
    S.log.unshift({ texto: texto, nat1: !!nat1 });
    S.log = S.log.slice(0, 4);
    renderLog();
    try { OBR.notification.show(texto, nat1 ? "WARNING" : "DEFAULT"); } catch (e) { /* ok */ }
    if (!remoto) {
      try { OBR.broadcast.sendMessage(CANAL, { texto: texto, nat1: !!nat1 }); } catch (e) { /* ok */ }
    }
  }

  /* ---------- ações dos botões ---------- */
  function acao(nome, v) {
    var f = fichaAtual();
    if (nome === "criar") { return criarFicha(S.sel, false); }
    if (nome === "restaurar") { return criarFicha(S.sel, true); }
    if (!f) return;

    if (nome === "rolar" || nome === "dado") {
      var quem = f.nome || f.dono || nomeDe(f.id);
      var modo = S.modo, per = S.per;
      if (nome === "rolar") {
        var rotulo = ATRS.filter(function (x) { return x[0] === v; })[0][1];
        var bonus = f.a[v] || 0;
        var t = fazerTeste(modo, bonus, per);
        registrarRolagem(textoTeste(quem, rotulo, modo, bonus, per, t), t.nat1);
      } else {
        var lados = parseInt(v, 10);
        var r = 1 + Math.floor(Math.random() * lados);
        registrarRolagem(quem + " · d" + lados + ": " + r, false);
      }
      return;
    }
    if (!podeEditar()) return;

    editar(function (f) {
      avisar("");
      if (nome === "inc") {
        var path = v.path, atual = parseInt(getPath(f, path), 10) || 0;
        setPath(f, path, clamp(atual + v.delta, -99, 999));
      } else if (nome === "up") {
        if (f.a[v] < 20) f.a[v] += 1;
        else avisar("Esse atributo já está no máximo (20).");
      } else if (nome === "d4") {
        var sorteio = 1 + Math.floor(Math.random() * 4);
        f.a[v] = sorteio;
        avisar(ATRS.filter(function (x) { return x[0] === v; })[0][1] + ": rolou 1d4 e tirou " + sorteio + ".");
      } else if (nome === "kit") {
        aplicarKit(f);
      } else if (nome === "nivel") {
        subirNivel(f);
      } else if (nome === "curto") {
        var cura = 1 + Math.floor(Math.random() * 6);
        f.vida[0] = Math.min(f.vida[1], f.vida[0] + cura);
        if (f.pm[1] > 0) f.pm[0] = Math.min(f.pm[1], f.pm[0] + 1);
        avisar("Descanso curto: +" + cura + " de Vida" + (f.pm[1] > 0 ? " e +1 PM" : "") + ".");
      } else if (nome === "longo") {
        f.vida[0] = f.vida[1]; f.pm[0] = f.pm[1];
        f.sorte = f.raca === "Humano" ? 3 : 2;
        avisar("Descanso longo: Vida, PM e Pontos de Sorte no máximo.");
      }
    });
  }

  function aplicarKit(f) {
    var c = CLASSES[f.classe], r = RACAS[f.raca];
    if (!c && !r) { avisar("Escolha uma raça e/ou uma classe da lista para aplicar o kit."); return; }
    var partes = [];
    if (r) {
      f.traco = r.traco;
      f.sorte = r.sorte;
      partes.push("Raça " + f.raca + ": " + r.bonus + " (some no atributo com o botão +1)");
    }
    if (c) {
      var vida = Math.max(1, c.vida + (r ? r.vida : 0));
      f.vida = [vida, vida];
      f.pm = [c.pm, c.pm];
      f.per = c.pericias;
      f.equip = c.equip;
      f.tal = c.talento;
      partes.push("Classe " + f.classe + ": Vida " + vida + ", PM " + c.pm);
    }
    avisar("Kit aplicado. " + partes.join(". ") + ". Role 1d4 para cada atributo (botão d4), role 2 Tralhas (pág. 16) e escolha as magias, se tiver.");
  }

  function subirNivel(f) {
    if (f.nivel >= 5) {
      avisar("Nível máximo (5). Na Masmorra Infinita, cada Chefe derrotado dá +4 de Vida e +1 em um atributo.");
      return;
    }
    f.nivel += 1;
    f.vida[1] += 4; f.vida[0] += 4;
    var extra = "";
    if (f.pm[1] > 0) { f.pm[1] += 1; f.pm[0] += 1; extra = " e +1 PM"; }
    var msg = "Nível " + f.nivel + ": +4 de Vida" + extra + ". Escolha 1 Talento novo da sua classe e anote nos talentos.";
    if (f.nivel === 3 || f.nivel === 5) msg += " Neste nível, suba 1 atributo (botão +1).";
    avisar(msg);
  }

  function criarFicha(id, doBackup) {
    var f = doBackup ? lerBackup(id) : null;
    if (!f) f = novaFicha(id, nomeDe(id));
    S.sheets[id] = f;
    S.sel = id;
    agendarSalvar();
    renderTudo();
  }

  /* ---------- renderização ---------- */
  function campoTexto(f, k, rotulo, max, dis, extra) {
    return '<label>' + rotulo + '<input data-k="' + k + '" maxlength="' + max + '" value="' + esc(f[k]) + '" ' +
      (extra || "") + " " + dis + "></label>";
  }
  function areaTexto(f, k, rotulo, max, dis, linhas) {
    return '<label>' + rotulo + '<textarea data-k="' + k + '" maxlength="' + max + '" rows="' + (linhas || 2) + '" ' + dis + ">" +
      esc(f[k]) + "</textarea></label>";
  }
  function vital(f, k, rotulo, dis) {
    return '<div class="vital"><b>' + rotulo + "</b>" +
      '<button data-a="inc" data-path="' + k + '.0" data-delta="-1" ' + dis + ">−</button>" +
      '<input type="number" data-k="' + k + '.0" value="' + esc(f[k][0]) + '" ' + dis + "> / " +
      '<input type="number" data-k="' + k + '.1" value="' + esc(f[k][1]) + '" ' + dis + ">" +
      '<button data-a="inc" data-path="' + k + '.0" data-delta="1" ' + dis + ">+</button></div>";
  }
  function renderForm() {
    var el = $("app"), f = fichaAtual();
    if (!f) {
      var meu = S.sel === S.myId;
      var temBackup = !!lerBackup(S.sel);
      el.innerHTML = '<div class="vazio">' +
        (meu ? "Você ainda não tem uma ficha nesta sala." : esc(nomeDe(S.sel)) + " ainda não tem ficha.") +
        '<br><button class="principal" data-a="criar">' + (meu ? "Criar minha ficha" : "Criar ficha para ele(a)") + "</button>" +
        (temBackup ? '<br><button data-a="restaurar">Restaurar a última ficha salva neste navegador</button>' : "") +
        "</div>";
      return;
    }
    var dis = podeEditar() ? "" : "disabled";
    var dono = S.sel !== S.myId ? '<p class="dica">Ficha de ' + esc(f.dono || nomeDe(f.id)) + (S.role === "GM" ? " (você pode editar)" : "") + ".</p>" : "";
    var attrs = ATRS.map(function (a) {
      return '<div class="attr"><span>' + a[1] + '</span><input type="number" data-k="a.' + a[0] + '" value="' + esc(f.a[a[0]]) + '" min="-9" max="20" ' + dis + ">" +
        '<button data-a="up" data-v="' + a[0] + '" title="Somar 1 ao atributo" ' + dis + ">+1</button>" +
        (f.nivel === 1 ? '<button data-a="d4" data-v="' + a[0] + '" title="Rolar 1d4 para definir o atributo" ' + dis + ">d4</button>" : "") +
        '<button class="rolar" data-a="rolar" data-v="' + a[0] + '">🎲 Rolar</button></div>';
    }).join("");
    var dadosGerais = [4, 6, 8, 10, 12, 20].map(function (d) {
      return '<button data-a="dado" data-v="' + d + '">d' + d + "</button>";
    }).join("");

    el.innerHTML =
      (S.aviso ? '<div class="aviso">' + esc(S.aviso) + "</div>" : "") + dono +
      '<section class="card"><h3>Herói</h3>' +
      '<div class="linha">' + campoTexto(f, "nome", "Nome", 40, dis) + campoTexto(f, "apelido", "Apelido", 40, dis) + "</div>" +
      '<div class="linha">' + campoTexto(f, "raca", "Raça", 24, dis, 'list="lista-racas"') +
      campoTexto(f, "classe", "Classe", 24, dis, 'list="lista-classes"') +
      '<label style="flex:0 0 52px">Nível<span class="nivel">' + esc(f.nivel) + "</span></label></div>" +
      '<div class="acoes">' +
      (f.nivel === 1 ? '<button data-a="kit" title="Preenche Vida, PM, perícias, equipamento e talento da classe e o traço da raça" ' + dis + ">Aplicar kit da raça/classe</button>" : "") +
      '<button data-a="nivel" ' + dis + ">Subir de nível</button></div></section>" +

      '<section class="card"><h3>Atributos</h3><div class="opcoes">' +
      '<select id="modo"><option value="normal"' + (S.modo === "normal" ? " selected" : "") + '>Normal</option>' +
      '<option value="vantagem"' + (S.modo === "vantagem" ? " selected" : "") + '>Vantagem</option>' +
      '<option value="desvantagem"' + (S.modo === "desvantagem" ? " selected" : "") + '>Desvantagem</option></select>' +
      '<label><input type="checkbox" id="per"' + (S.per ? " checked" : "") + "> Perícia (+2)</label></div>" +
      attrs + '<p class="dica">Teste: 1d20 + o número do atributo (+2 com perícia). Natural 1 = Encrenca! No início, role 1d4 para cada atributo (botão d4).</p></section>' +

      '<section class="card"><h3>Estado</h3>' + vital(f, "vida", "Vida", dis) + vital(f, "pm", "PM", dis) +
      '<div class="vital"><b>Sorte</b><button data-a="inc" data-path="sorte" data-delta="-1" ' + dis + ">−</button>" +
      '<input type="number" data-k="sorte" value="' + esc(f.sorte) + '" ' + dis + '><button data-a="inc" data-path="sorte" data-delta="1" ' + dis + ">+</button></div>" +
      '<div class="linha" style="margin-top:6px">' +
      '<label>Armadura (bônus)<input type="number" data-k="arm" value="' + esc(f.arm) + '" ' + dis + "></label>" +
      '<label>Cobres<input type="number" data-k="cobres" value="' + esc(f.cobres) + '" ' + dis + "></label></div>" +
      '<div class="acoes"><button data-a="curto" ' + dis + '>Descanso curto</button><button data-a="longo" ' + dis + ">Descanso longo</button></div></section>" +

      '<section class="card"><h3>Perícias, equipamento e talentos</h3>' +
      areaTexto(f, "per", "Perícias (+2)", 120, dis, 2) + areaTexto(f, "equip", "Equipamento e Tralhas", 350, dis, 3) +
      areaTexto(f, "tal", "Talentos", 350, dis, 3) + areaTexto(f, "mag", "Magias", 300, dis, 2) +
      areaTexto(f, "traco", "Traço da raça", 160, dis, 2) + areaTexto(f, "notas", "Notas", 300, dis, 2) + "</section>" +

      '<section class="card"><h3>Dados rápidos</h3><div class="dados">' + dadosGerais + "</div></section>";
  }

  function renderResumo() {
    var el = $("resumo");
    if (S.role !== "GM") { el.innerHTML = ""; return; }
    var vistos = {}, chips = [];
    Object.keys(S.sheets).forEach(function (id) {
      vistos[id] = true;
      var f = S.sheets[id];
      chips.push({ id: id, nome: f.nome || f.dono || nomeDe(id), f: f });
    });
    [{ id: S.myId, name: S.myName }].concat(S.players).forEach(function (p) {
      if (p && p.id && !vistos[p.id]) { vistos[p.id] = true; chips.push({ id: p.id, nome: p.name || "Jogador", f: null }); }
    });
    chips.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    el.innerHTML = chips.map(function (c) {
      var corpo = c.f
        ? "<small>Nv " + esc(c.f.nivel) + " · " + esc(c.f.classe || "—") + "</small><small>V " + esc(c.f.vida[0]) + "/" + esc(c.f.vida[1]) +
          " · PM " + esc(c.f.pm[0]) + "/" + esc(c.f.pm[1]) + " · PS " + esc(c.f.sorte) + "</small>"
        : "<small>sem ficha</small>";
      return '<button class="chip' + (c.id === S.sel ? " sel" : "") + (c.f ? "" : " sem") + '" data-sel="' + esc(c.id) + '"><strong>' +
        esc(c.nome) + "</strong>" + corpo + "</button>";
    }).join("");
  }

  function renderLog() {
    $("log").innerHTML = S.log.map(function (l) {
      return '<div class="' + (l.nat1 ? "nat1" : "") + '">' + esc(l.texto) + "</div>";
    }).join("");
  }

  function renderRodape() {
    var el = $("rodape");
    if (S.role === "GM") {
      var bytes = 0;
      try { bytes = new TextEncoder().encode(JSON.stringify(S.meta || {})).length; } catch (e) { bytes = 0; }
      var pct = Math.round((bytes / LIMITE_SALA) * 100);
      el.innerHTML = "Espaço da sala usado por todas as extensões: " + (bytes / 1000).toFixed(1) + " de 16 kB (" + pct + "%)." +
        (pct >= 75 ? ' <span class="alerta">Perto do limite: enxugue textos longos das fichas.</span>' : "");
    } else {
      el.textContent = "Sua ficha fica salva na sala. Só você e o mestre a editam por aqui.";
    }
  }

  function renderTudo() { renderResumo(); renderLog(); renderForm(); renderRodape(); }

  /* ---------- eventos da interface ---------- */
  function ligarEventos() {
    var app = $("app");

    app.addEventListener("input", function (e) {
      var t = e.target;
      if (t.id === "modo") { S.modo = t.value; return; }
      if (t.id === "per") { S.per = t.checked; return; }
      var k = t.dataset && t.dataset.k;
      var f = fichaAtual();
      if (!k || !f || !podeEditar()) return;
      var val = t.value;
      if (t.type === "number") {
        val = parseInt(val, 10) || 0;
        val = k.indexOf("a.") === 0 ? clamp(val, -9, 20) : clamp(val, -99, 9999);
      }
      setPath(f, k, val);
      agendarSalvar();
      renderResumo();
    });

    app.addEventListener("change", function (e) {
      if (e.target.id === "per") S.per = e.target.checked;
      if (e.target.id === "modo") S.modo = e.target.value;
    });

    app.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]");
      if (!b || b.disabled) return;
      var nome = b.dataset.a, v = b.dataset.v;
      if (nome === "inc") v = { path: b.dataset.path, delta: parseInt(b.dataset.delta, 10) };
      acao(nome, v);
    });

    app.addEventListener("focusout", function () {
      setTimeout(function () {
        if (S.pendingRemote && !S.dirty && !emFoco()) { S.pendingRemote = false; renderForm(); }
      }, 50);
    });

    $("resumo").addEventListener("click", function (e) {
      var b = e.target.closest("[data-sel]");
      if (!b) return;
      if (S.dirty) salvar();
      S.sel = b.dataset.sel;
      avisar("");
      renderResumo(); renderForm();
    });
  }

  /* ---------- sincronização ---------- */
  function aoMudarMeta(meta) {
    S.meta = meta || {};
    var novo = fichasDaMeta(S.meta);
    var editando = S.dirty ? S.dirtyId : "";
    var antes = JSON.stringify(S.sheets[S.sel] || null);
    Object.keys(S.sheets).forEach(function (id) { if (!(id in novo) && id !== editando) delete S.sheets[id]; });
    Object.keys(novo).forEach(function (id) { if (id !== editando) S.sheets[id] = novo[id]; });
    if (S.sel !== editando && JSON.stringify(S.sheets[S.sel] || null) !== antes) {
      if (emFoco()) S.pendingRemote = true; else renderForm();
    }
    renderResumo();
    renderRodape();
  }

  function iniciar() {
    var OBR = window.OBR;
    Object.keys(RACAS).forEach(function (r) { $("lista-racas").insertAdjacentHTML("beforeend", '<option value="' + esc(r) + '">'); });
    Object.keys(CLASSES).forEach(function (c) { $("lista-classes").insertAdjacentHTML("beforeend", '<option value="' + esc(c) + '">'); });
    ligarEventos();

    OBR.onReady(function () {
      S.myId = OBR.player.id;
      S.roomId = OBR.room.id || "sala";
      Promise.all([
        OBR.player.getRole(),
        OBR.player.getName(),
        OBR.room.getMetadata(),
        OBR.party.getPlayers().catch(function () { return []; })
      ]).then(function (r) {
        S.role = r[0]; S.myName = r[1]; S.meta = r[2] || {}; S.players = r[3] || [];
        S.sheets = fichasDaMeta(S.meta);
        S.sel = S.myId;
        renderTudo();

        OBR.room.onMetadataChange(aoMudarMeta);
        OBR.player.onChange(function (p) {
          var mudou = p.role !== S.role;
          S.role = p.role; S.myName = p.name;
          if (mudou) renderTudo(); else renderResumo();
        });
        OBR.party.onChange(function (lista) { S.players = lista || []; renderResumo(); });
        OBR.broadcast.onMessage(CANAL, function (ev) {
          if (ev && ev.data && ev.data.texto) registrarRolagem(String(ev.data.texto).slice(0, 200), ev.data.nat1, true);
        });
      }).catch(function (e) {
        $("app").innerHTML = '<div class="vazio">Não consegui ler os dados da sala.<br><small>' + esc(e && e.message) + "</small></div>";
      });
    });
  }

  function carregarSdk(url, ok, falha) {
    var s = document.createElement("script");
    s.src = url; s.onload = ok; s.onerror = falha;
    document.head.appendChild(s);
  }

  if (window.OBR) {
    iniciar();
  } else {
    carregarSdk(SDK_URL_RESERVA, iniciar, function () {
      $("app").innerHTML = '<div class="vazio">Não consegui carregar o SDK do Owlbear Rodeo.<br><small>Verifique sua conexão e abra a extensão de dentro de uma sala do Owlbear.</small></div>';
    });
  }
})();
