/* =========================================================
   Книга о вкусной и здоровой пище — app logic
   No frameworks; RECIPES comes from data.js
   ========================================================= */
(function(){
  'use strict';

  // ---------- category meta: color + icon key ----------
  var CAT_META = {
    'ХОЛОДНЫЕ БЛЮДА И ЗАКУСКИ':      {color:'#3E6B39', icon:'plate'},
    'БУЛЬОНЫ И СУПЫ':                 {color:'#B07C24', icon:'bowl'},
    'РЫБА':                           {color:'#3B6478', icon:'fish'},
    'МЯСО':                           {color:'#7C2119', icon:'meat'},
    'ДОМАШНЯЯ ПТИЦА И ДИЧЬ':          {color:'#8A5A26', icon:'bird'},
    'ОВОЩИ И ГРИБЫ':                  {color:'#4C5B3A', icon:'leaf'},
    'КРУПЯНЫЕ И МУЧНЫЕ БЛЮДА':        {color:'#A8862E', icon:'grain'},
    'БЛЮДА ИЗ ФАСОЛИ, ГОРОХА, ЧЕЧЕВИЦЫ':{color:'#5A6B3E', icon:'bean'},
    'МОЛОЧНЫЕ И ЯИЧНЫЕ БЛЮДА':        {color:'#5C7A6E', icon:'egg'},
    'ИЗДЕЛИЯ ИЗ ТЕСТА':               {color:'#B4862A', icon:'pretzel'},
    'СЛАДКИЕ БЛЮДА':                  {color:'#B4536B', icon:'sweet'},
    'ПИЩА РЕБЕНКА':                   {color:'#4E6E8E', icon:'baby'},
    'ЛЕЧЕБНОЕ ПИТАНИЕ':               {color:'#6B5178', icon:'cross'},
    'ВАРЕНЬЕ, МАРИНАДЫ, СОЛЕНЬЯ':     {color:'#8A3B1F', icon:'jar'},
    'ИЗ КУЛИНАРНОГО БЛОКНОТА':        {color:'#6B5178', icon:'sweet'}
  };

  var ICONS = {
    plate:  '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
    bowl:   '<path d="M3 12h18a8 8 0 0 1-8 7H11a8 8 0 0 1-8-7z"/><path d="M9 12V7a3 3 0 0 1 6 0v5"/>',
    fish:   '<path d="M3 12c3-4 8-6 12-4 2 1 4 2.5 6 4-2 1.5-4 3-6 4-4 2-9 0-12-4z"/><circle cx="16" cy="10.5" r=".6" fill="currentColor" stroke="none"/><path d="M3 12l-2-3M3 12l-2 3"/>',
    meat:   '<path d="M8 15c-3-3-3-8 1-10 3-1.7 6 .3 6 3 3-1 5 1 4 4-1.5 4.5-6 6.5-9 5-1 1.5-3 3-5 3-1.2 0-2-.8-2-1.8 0-1.7 2.5-2 5-3.2z"/>',
    bird:   '<path d="M5 14c0-5 3.5-9 8-9s7 3 7 6c0 2-1.5 3-3 3l1 4-3-1-2 2-2-2c-4 0-6-1-6-3z"/><circle cx="15" cy="8.4" r=".6" fill="currentColor" stroke="none"/>',
    leaf:   '<path d="M4 20c0-9 6-15 16-15-1 10-7 16-16 15z"/><path d="M5 19l8-8"/>',
    grain:  '<path d="M12 3v18"/><path d="M12 6c-3 0-5 1.5-5 3.5S9 12 12 12M12 6c3 0 5 1.5 5 3.5S15 12 12 12M12 12c-3 0-5 1.5-5 3.5S9 18 12 18M12 12c3 0 5 1.5 5 3.5S15 18 12 18"/>',
    bean:   '<ellipse cx="9" cy="9" rx="4" ry="5.2" transform="rotate(-30 9 9)"/><ellipse cx="15" cy="15" rx="4" ry="5.2" transform="rotate(-30 15 15)"/>',
    egg:    '<path d="M12 21c4 0 6.5-3.2 6.5-7.2C18.5 8.6 15.5 3 12 3S5.5 8.6 5.5 13.8C5.5 17.8 8 21 12 21z"/>',
    pretzel:'<path d="M7 5c-3 0-4 3-2 5l7 6c2 2 1 5-2 5-2 0-3-1-3-1"/><path d="M17 5c3 0 4 3 2 5l-7 6c-2 2-1 5 2 5 2 0 3-1 3-1"/>',
    sweet:  '<circle cx="12" cy="12" r="4"/><path d="M4 8L1 5M4 16l-3 3M20 8l3-3M20 16l3 3"/>',
    baby:   '<circle cx="12" cy="8" r="4"/><path d="M6 21c0-4 2.5-6 6-6s6 2 6 6"/>',
    cross:  '<path d="M12 4v16M4 12h16" stroke-width="2.4"/><circle cx="12" cy="12" r="9"/>',
    jar:    '<path d="M8 3h8v3.5c1.2.6 2 1.8 2 3.3V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9.8c0-1.5.8-2.7 2-3.3V3z"/><path d="M6 12h12"/>'
  };

  function svgIcon(key, cls){
    var body = ICONS[key] || ICONS.plate;
    return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
  }

  // ---------- user recipes (own additions, persisted) ----------
  var USER_KEY = 'kniga1952_user_recipes';
  var userRecipes;
  try{
    userRecipes = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
  }catch(e){ userRecipes = []; }
  function saveUserRecipes(){
    try{ localStorage.setItem(USER_KEY, JSON.stringify(userRecipes)); }catch(e){}
  }

  // ---------- build indices (base book recipes + user's own) ----------
  var byId, byCat, catOrder, ALL;
  function rebuildIndex(){
    byId = {}; byCat = {}; catOrder = [];
    ALL = RECIPES.concat(userRecipes);
    ALL.forEach(function(r){
      byId[r.id] = r;
      if(!byCat[r.c]){ byCat[r.c] = {order:[], subs:{}}; catOrder.push(r.c); }
      byCat[r.c].order.push(r.id);
      var sub = r.s || 'Общее';
      if(!byCat[r.c].subs[sub]) byCat[r.c].subs[sub] = [];
      byCat[r.c].subs[sub].push(r.id);
    });
  }
  rebuildIndex();

  // ---------- favorites ----------
  var FAV_KEY = 'kniga1952_favorites';
  var favorites;
  try{
    favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
  }catch(e){ favorites = new Set(); }
  function saveFavs(){
    try{ localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites))); }catch(e){}
  }
  function toggleFav(id){
    if(favorites.has(id)) favorites.delete(id); else favorites.add(id);
    saveFavs();
  }

  // ---------- dom shortcut (needed early for theme setup) ----------
  var $ = function(sel){ return document.querySelector(sel); };

  // ---------- theme (light / dark, persisted) ----------
  var THEME_KEY = 'kniga1952_theme';
  var themeBtn = $('#themeBtn');
  var sunIcon = $('#themeIconSun');
  var moonIcon = $('#themeIconMoon');
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function systemPrefersDark(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function currentTheme(){
    var stored = null;
    try{ stored = localStorage.getItem(THEME_KEY); }catch(e){}
    if(stored === 'dark' || stored === 'light') return stored;
    return systemPrefersDark() ? 'dark' : 'light';
  }
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    sunIcon.hidden = isDark;
    moonIcon.hidden = !isDark;
    themeBtn.setAttribute('aria-label', isDark ? 'Светлая тема' : 'Тёмная тема');
    if(metaTheme) metaTheme.setAttribute('content', isDark ? '#25361E' : '#3E6B39');
  }
  function setTheme(theme, persist){
    applyTheme(theme);
    if(persist){
      try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
    }
  }
  themeBtn.addEventListener('click', function(){
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  });
  applyTheme(currentTheme());
  if(window.matchMedia){
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var mqHandler = function(){
      var stored = null;
      try{ stored = localStorage.getItem(THEME_KEY); }catch(e){}
      if(stored !== 'dark' && stored !== 'light'){
        applyTheme(mq.matches ? 'dark' : 'light');
      }
    };
    if(mq.addEventListener) mq.addEventListener('change', mqHandler);
    else if(mq.addListener) mq.addListener(mqHandler);
  }

  // ---------- dom refs ----------
  var screens = {
    home: $('#screen-home'),
    search: $('#screen-search'),
    category: $('#screen-category'),
    fav: $('#screen-fav'),
    recipe: $('#screen-recipe'),
    add: $('#screen-add')
  };
  var catGrid = $('#catGrid');
  var searchInput = $('#searchInput');
  var searchResults = $('#searchResults');
  var searchCount = $('#searchCount');
  var catTitle = $('#catTitle');
  var catEyebrow = $('#catEyebrow');
  var subChips = $('#subChips');
  var catRecipes = $('#catRecipes');
  var favRecipes = $('#favRecipes');
  var favEmpty = $('#favEmpty');
  var backBtn = $('#backBtn');
  var favBtnTop = $('#favBtn');
  var bottomNav = $('#bottomNav');
  var main = $('#main');
  var fabAdd = $('#fabAdd');
  var addForm = $('#addForm');
  var currentEditId = null;

  // ---------- nav state stack ----------
  var state = { screen:'home', cat:null, sub:null, recipeId:null };
  var stack = [];

  function setActiveNav(name){
    document.querySelectorAll('.nav-btn').forEach(function(b){
      b.classList.toggle('is-active', b.dataset.nav===name);
    });
  }

  function showScreen(name){
    Object.keys(screens).forEach(function(k){
      screens[k].hidden = (k!==name);
    });
    backBtn.hidden = (name==='home' || name==='search' || name==='fav');
    bottomNav.style.display = 'flex';
    fabAdd.hidden = (name==='add' || name==='recipe');
    if(name==='home') setActiveNav('home');
    else if(name==='search') setActiveNav('search');
    else if(name==='fav') setActiveNav('fav');
    else setActiveNav('');
    if(typeof main.scrollTo === 'function'){ try{ main.scrollTo(0,0); }catch(e){} }
    window.scrollTo(0,0);
  }

  function go(newState, push){
    if(push !== false) stack.push(JSON.parse(JSON.stringify(state)));
    state = newState;
    render();
  }

  function goBack(){
    if(stack.length){
      state = stack.pop();
      render();
    } else {
      state = {screen:'home'};
      render();
    }
  }

  // ---------- renderers ----------
  function renderHome(){
    catGrid.innerHTML = catOrder.map(function(cat){
      var meta = CAT_META[cat] || {color:'#3E6B39', icon:'plate'};
      var count = byCat[cat].order.length;
      return '<button class="cat-card" style="--cat-color:'+meta.color+'" data-cat="'+encodeURIComponent(cat)+'">'+
        svgIcon(meta.icon,'cat-ico')+
        '<span class="cat-name">'+cat.charAt(0)+cat.slice(1).toLowerCase()+'</span>'+
        '<span class="cat-count">'+count+' рец.</span>'+
        '</button>';
    }).join('');
  }

  function imgSrc(path){
    return path.indexOf('data:') === 0 ? path : encodeURI(path);
  }

  function recipeCardHtml(r){
    var isFav = favorites.has(r.id);
    var subLabel = r.s ? r.s.charAt(0)+r.s.slice(1).toLowerCase() : '';
    var badge = r.custom ? '<span class="badge-custom">своё</span>' : '';
    var thumb = r.img ? '<img class="rc-thumb" src="'+imgSrc(r.img)+'" alt="" loading="lazy">' : '';
    var meta = r.p ? '<span>стр. '+r.p+'</span>' : '';
    return '<div class="recipe-card">'+
      thumb+
      '<button class="rc-main" data-open="'+r.id+'" style="text-align:left;background:none;border:none;padding:0;">'+
        '<div class="rc-title">'+r.t+badge+'</div>'+
        '<div class="rc-meta">'+meta+(subLabel?'<span>'+subLabel+'</span>':'')+'</div>'+
      '</button>'+
      '<button class="rc-fav'+(isFav?' is-fav':'')+'" data-fav="'+r.id+'" aria-label="В избранное">'+
        '<svg viewBox="0 0 24 24" fill="'+(isFav?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.35-9.5-8.8C.7 7.6 2.4 4 6 4c2 0 3.3 1 4 2.3C10.7 5 12 4 14 4c3.6 0 5.3 3.6 3.5 7.2C19 15.65 12 20 12 20z"/></svg>'+
      '</button>'+
    '</div>';
  }

  function renderCategory(){
    var cat = state.cat;
    var meta = CAT_META[cat] || {};
    catEyebrow.textContent = 'Раздел · ' + byCat[cat].order.length + ' рецептов';
    catTitle.textContent = cat.charAt(0)+cat.slice(1).toLowerCase();
    catTitle.style.color = meta.color || '';
    var subs = Object.keys(byCat[cat].subs);
    var activeSub = state.sub || 'ALL';
    subChips.innerHTML = ['<button class="chip'+(activeSub==='ALL'?' is-active':'')+'" data-sub="ALL">Все</button>']
      .concat(subs.map(function(s){
        var label = s.charAt(0)+s.slice(1).toLowerCase();
        return '<button class="chip'+(activeSub===s?' is-active':'')+'" data-sub="'+encodeURIComponent(s)+'">'+label+'</button>';
      })).join('');
    var ids = activeSub==='ALL' ? byCat[cat].order : byCat[cat].subs[activeSub];
    catRecipes.innerHTML = ids.map(function(id){ return recipeCardHtml(byId[id]); }).join('') ||
      '<p class="empty-note">В этом разделе рецепты не распознаны из скана.</p>';
  }

  function renderSearch(q){
    if(!q || q.trim().length < 2){
      searchCount.textContent = 'Введите не менее 2 символов';
      searchResults.innerHTML = '';
      return;
    }
    var nq = q.trim().toLowerCase();
    var res = ALL.filter(function(r){ return r.t.toLowerCase().indexOf(nq) !== -1; }).slice(0,150);
    searchCount.textContent = 'Найдено: ' + res.length;
    searchResults.innerHTML = res.map(recipeCardHtml).join('') ||
      '<p class="empty-note">Ничего не найдено. Попробуйте другое слово.</p>';
  }

  function renderFav(){
    var ids = Array.from(favorites);
    favEmpty.hidden = ids.length > 0;
    favRecipes.innerHTML = ids.map(function(id){ return byId[id] ? recipeCardHtml(byId[id]) : ''; }).join('');
  }

  function renderRecipe(){
    var r = byId[state.recipeId];
    if(!r){ goBack(); return; }
    $('#recipeCrumb').textContent = (r.c.charAt(0)+r.c.slice(1).toLowerCase()) + (r.s ? ' · '+(r.s.charAt(0)+r.s.slice(1).toLowerCase()) : '');
    $('#recipeTitle').textContent = r.t;
    var favToggle = $('#favToggle');
    favToggle.classList.toggle('is-fav', favorites.has(r.id));
    favToggle.onclick = function(){
      toggleFav(r.id);
      favToggle.classList.toggle('is-fav', favorites.has(r.id));
    };
    var editToggle = $('#editToggle');
    editToggle.hidden = !r.custom;
    editToggle.onclick = function(){ openAddForm(r); };
    var coverBox = $('#recipeCover');
    if(r.img){
      coverBox.hidden = false;
      coverBox.innerHTML = '<img src="'+imgSrc(r.img)+'" alt="" loading="lazy">';
    } else {
      coverBox.hidden = true;
      coverBox.innerHTML = '';
    }
    var ingBox = $('#ingredientsBox');
    if(r.i){
      ingBox.hidden = false;
      $('#ingredientsText').textContent = r.i;
    } else {
      ingBox.hidden = true;
    }
    var bodyEl = $('#recipeBody');
    if(r.b && r.b.trim()){
      var lines = r.b.split('\n');
      var html = '';
      lines.forEach(function(line){
        var t = line.trim();
        if(!t) return;
        var m = /^\[\[IMG:(.+)\]\]$/.exec(t);
        if(m){
          html += '<img class="recipe-inline-img" src="'+imgSrc(m[1])+'" alt="" loading="lazy">';
        } else {
          html += '<p>'+escapeHtml(t)+'</p>';
        }
      });
      bodyEl.innerHTML = html || '<p class="recipe-note">Текст рецепта пуст.</p>';
    } else {
      bodyEl.innerHTML = '<p class="recipe-note">Полный текст этого рецепта не удалось надёжно распознать при сканировании — сверьтесь с оригиналом книги на указанной странице.</p>';
    }
    if(r.custom){
      $('#recipePageNum').textContent = r.p ? ('Свой рецепт · ' + r.p) : 'Свой рецепт';
    } else if(r.notebook){
      $('#recipePageNum').textContent = 'Из кулинарного блокнота';
    } else {
      $('#recipePageNum').textContent = r.p ? ('Книга о вкусной и здоровой пище, 1952 · стр. ' + r.p) : 'Книга о вкусной и здоровой пище, 1952';
    }
  }

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function render(){
    switch(state.screen){
      case 'home': showScreen('home'); renderHome(); break;
      case 'search': showScreen('search'); searchInput.focus({preventScroll:true}); renderSearch(searchInput.value); break;
      case 'category': showScreen('category'); renderCategory(); break;
      case 'fav': showScreen('fav'); renderFav(); break;
      case 'recipe': showScreen('recipe'); renderRecipe(); break;
      case 'add': showScreen('add'); break;
    }
  }

  // ---------- event delegation ----------
  document.addEventListener('click', function(e){
    var openBtn = e.target.closest('[data-open]');
    if(openBtn){
      go({screen:'recipe', recipeId:parseInt(openBtn.dataset.open,10), cat:state.cat, sub:state.sub});
      return;
    }
    var favBtn = e.target.closest('[data-fav]');
    if(favBtn){
      e.preventDefault();
      var id = parseInt(favBtn.dataset.fav,10);
      toggleFav(id);
      favBtn.classList.toggle('is-fav', favorites.has(id));
      var svg = favBtn.querySelector('svg');
      svg.setAttribute('fill', favorites.has(id) ? 'currentColor' : 'none');
      if(state.screen === 'fav') renderFav();
      return;
    }
    var catBtn = e.target.closest('[data-cat]');
    if(catBtn){
      go({screen:'category', cat:decodeURIComponent(catBtn.dataset.cat), sub:null});
      return;
    }
    var subBtn = e.target.closest('[data-sub]');
    if(subBtn){
      var s = subBtn.dataset.sub === 'ALL' ? null : decodeURIComponent(subBtn.dataset.sub);
      state.sub = s;
      renderCategory();
      return;
    }
    var navBtn = e.target.closest('.nav-btn');
    if(navBtn){
      var target = navBtn.dataset.nav;
      go({screen:target}, true);
      return;
    }
  });

  backBtn.addEventListener('click', function(){ history.back(); });
  favBtnTop.addEventListener('click', function(){ go({screen:'fav'}); });

  var searchDebounce;
  searchInput.addEventListener('input', function(){
    clearTimeout(searchDebounce);
    var v = searchInput.value;
    searchDebounce = setTimeout(function(){
      if(state.screen !== 'search'){ go({screen:'search'}); }
      renderSearch(v);
    }, 120);
  });
  searchInput.addEventListener('focus', function(){
    if(state.screen !== 'search') go({screen:'search'});
  });

  // hardware / gesture back button (Android): each go() also pushes a
  // history entry, so the OS back gesture triggers popstate → goBack()
  var origGo = go;
  go = function(newState, push){
    origGo(newState, push);
    if(push !== false){
      try{ history.pushState({depth:stack.length}, ''); }catch(e){}
    }
  };
  window.addEventListener('popstate', function(){
    goBack();
  });

  // ---------- photo picker (own recipes) ----------
  var currentPhoto = null; // data URL or null
  var photoPreview = $('#fPhotoPreview');
  var photoImg = $('#fPhotoImg');
  var photoInput = $('#fPhotoInput');
  var photoUploadBtn = $('#fPhotoUploadBtn');

  function setPhoto(dataUrl){
    currentPhoto = dataUrl;
    if(dataUrl){
      photoImg.src = dataUrl;
      photoPreview.hidden = false;
      photoUploadBtn.hidden = true;
    } else {
      photoImg.src = '';
      photoPreview.hidden = true;
      photoUploadBtn.hidden = false;
    }
  }

  function resizeImageFile(file, maxSize, quality){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function(){
        var img = new Image();
        img.onerror = reject;
        img.onload = function(){
          var w = img.width, h = img.height;
          if(w > maxSize || h > maxSize){
            if(w > h){ h = Math.round(h * maxSize / w); w = maxSize; }
            else { w = Math.round(w * maxSize / h); h = maxSize; }
          }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  photoInput.addEventListener('change', function(){
    var file = photoInput.files && photoInput.files[0];
    if(!file) return;
    resizeImageFile(file, 1000, 0.82).then(setPhoto).catch(function(){
      alert('Не удалось загрузить это фото. Попробуйте другой файл.');
    });
    photoInput.value = '';
  });
  $('#fPhotoRemove').addEventListener('click', function(){ setPhoto(null); });

  // ---------- add / edit own recipe ----------
  function populateCategorySelect(selected){
    var sel = $('#fCategory');
    var opts = catOrder.map(function(c){
      var label = c.charAt(0)+c.slice(1).toLowerCase();
      return '<option value="'+encodeURIComponent(c)+'">'+label+'</option>';
    });
    opts.push('<option value="__custom__">+ Новый раздел…</option>');
    sel.innerHTML = opts.join('');
    if(selected && catOrder.indexOf(selected) !== -1){
      sel.value = encodeURIComponent(selected);
    } else if(selected){
      sel.value = '__custom__';
    } else {
      sel.selectedIndex = 0;
    }
    toggleCustomCategoryField();
  }
  function toggleCustomCategoryField(){
    var isCustom = $('#fCategory').value === '__custom__';
    $('#fCategoryCustomWrap').hidden = !isCustom;
  }
  $('#fCategory').addEventListener('change', toggleCustomCategoryField);

  function openAddForm(existing){
    currentEditId = existing ? existing.id : null;
    $('#addTitle').textContent = existing ? 'Редактировать рецепт' : 'Новый рецепт';
    $('#fTitle').value = existing ? existing.t : '';
    populateCategorySelect(existing ? existing.c : null);
    if(existing && catOrder.indexOf(existing.c) === -1){
      $('#fCategoryCustom').value = existing.c;
    } else {
      $('#fCategoryCustom').value = '';
    }
    $('#fSub').value = (existing && existing.s) ? existing.s : '';
    $('#fIngredients').value = (existing && existing.i) ? existing.i : '';
    $('#fBody').value = (existing && existing.b) ? existing.b : '';
    $('#fPage').value = (existing && existing.p) ? existing.p : '';
    setPhoto(existing && existing.img ? existing.img : null);
    $('#fDelete').hidden = !existing;
    go({screen:'add'});
  }

  addForm.addEventListener('submit', function(e){
    e.preventDefault();
    var title = $('#fTitle').value.trim();
    var body = $('#fBody').value.trim();
    var selVal = $('#fCategory').value;
    var category = selVal === '__custom__' ? $('#fCategoryCustom').value.trim() : decodeURIComponent(selVal);
    if(!title || !body || !category){
      if(selVal === '__custom__' && !category){ $('#fCategoryCustom').focus(); }
      return;
    }
    var sub = $('#fSub').value.trim() || null;
    var ing = $('#fIngredients').value.trim() || null;
    var page = $('#fPage').value.trim() || null;
    var img = currentPhoto || null;

    var savedId;
    if(currentEditId !== null){
      var idx = userRecipes.findIndex(function(r){ return r.id === currentEditId; });
      if(idx !== -1){
        userRecipes[idx] = Object.assign({}, userRecipes[idx], {
          t:title, c:category, s:sub, i:ing, b:body, p:page, img:img
        });
        savedId = currentEditId;
      }
    } else {
      savedId = Date.now();
      userRecipes.push({ id:savedId, t:title, c:category, s:sub, p:page, i:ing, b:body, img:img, custom:true });
    }
    saveUserRecipes();
    rebuildIndex();
    go({screen:'recipe', recipeId:savedId});
  });

  $('#fCancel').addEventListener('click', function(){ history.back(); });

  $('#fDelete').addEventListener('click', function(){
    if(currentEditId === null) return;
    if(!window.confirm('Удалить этот рецепт? Это действие нельзя отменить.')) return;
    userRecipes = userRecipes.filter(function(r){ return r.id !== currentEditId; });
    saveUserRecipes();
    rebuildIndex();
    favorites.delete(currentEditId);
    saveFavs();
    currentEditId = null;
    state = {screen:'home'};
    stack = [];
    render();
  });

  fabAdd.addEventListener('click', function(){ openAddForm(null); });

  // ---------- service worker ----------
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){ /* offline install may be unavailable, app still works */ });
    });
  }

  // ---------- init ----------
  render();
})();
