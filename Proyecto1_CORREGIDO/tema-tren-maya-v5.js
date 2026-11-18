/* Tema V5: la navegación y el alta de registros originales siguen en dashboard.js.
   Este módulo consulta Programaciones exclusivamente en modo lectura.
   Nunca utiliza datos simulados ni ejecuta escrituras. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const summary=$('tmV5Registros');if(!summary)return;
 const $search=$('tmV5Buscar');const $count=$('tmV5TotalMostrados');const $clear=$('tmV5Limpiar');
 let rows=[];let ready=false;let selected='todos';
 const plain=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function type(row){
    const s=plain(row.estatus);
    if(/transito|circulando|en ruta|en camino/.test(s))return 'transito';
    if(/patio|maniobra|clasific/.test(s))return 'patio';
    if(/finaliz|concluid|complet|realizad|terminad/.test(s))return 'finalizado';
    if(/programad|pendiente|planific/.test(s))return 'programado';
    return 'otro';
 }
 const date=v=>{if(!v)return '—';const d=String(v).substring(0,10).split('-');return d.length===3?`${d[2]}/${d[1]}/${d[0]}`:String(v);};
 function el(tag,txt,cls){const node=document.createElement(tag);if(txt!==null&&txt!==undefined)node.textContent=txt;if(cls)node.className=cls;return node;}
 function render(){
    const q=plain($search?.value||'');
    const filtered=rows.filter(r=>(selected==='todos'||type(r)===selected)&&(!q||plain([r.fecha,r.no_locomotora,r.origen,r.destino,r.estatus].join(' ')).includes(q)));
    summary.replaceChildren();
    if(!ready){ const tr=el('tr');const td=el('td','Sin conexión a las programaciones; verifica el acceso y la red.','tm-v5-empty');td.colSpan=6;tr.append(td);summary.append(tr);return; }
    if(!filtered.length){const tr=el('tr');const td=el('td',rows.length?'No hay resultados para esta búsqueda.':'No hay programaciones registradas.','tm-v5-empty');td.colSpan=6;tr.append(td);summary.append(tr);}
    for(const r of filtered.slice(0,15)){
       const tr=el('tr');
       for(const val of [date(r.fecha),r.no_locomotora||'—',r.origen||'—',r.destino||'—']) tr.append(el('td',val));
       const td=el('td'),badge=el('span',r.estatus||'Sin estado','tm-v5-pill '+type(r));td.append(badge);tr.append(td);
       const actions=el('td'),a=el('a','Abrir ↗','tm-v5-row-link');a.href='servicio-patio.html';a.setAttribute('aria-label','Abrir módulo de operaciones');actions.append(a);tr.append(actions);summary.append(tr);
    }
    $count.textContent=`${filtered.length} registro(s) encontrados · mostrando ${Math.min(15,filtered.length)}`;
    if($clear)$clear.hidden=selected==='todos'&&!q;
    document.querySelectorAll('.tm-v5-kpi').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kpi===selected)));
 }
 function updateKpis(){
    $('tmV5Total').textContent=rows.length.toLocaleString('es-MX');
    $('tmV5Transito').textContent=rows.filter(r=>type(r)==='transito').length.toLocaleString('es-MX');
    $('tmV5Patio').textContent=rows.filter(r=>type(r)==='patio').length.toLocaleString('es-MX');
    $('tmV5Finalizados').textContent=rows.filter(r=>type(r)==='finalizado').length.toLocaleString('es-MX');
 }
 async function load(){
   // Supabase exists only once dashboard.js has initialized.
   if(typeof supabaseClient==='undefined'){$count.textContent='No se inició el cliente de datos';render();return;}
   try{
      const {data,error}=await supabaseClient.from('Programaciones')
        .select('id,fecha,no_locomotora,origen,destino,estatus').order('fecha',{ascending:false}).limit(500);
      if(error)throw error;
      rows=Array.isArray(data)?data:[];ready=true;updateKpis();render();
   }catch(e){console.warn('Tema V5: no fue posible leer Programaciones',e);$count.textContent='No se pudo consultar el servidor';render();}
 }
 document.addEventListener('DOMContentLoaded',()=>{
    const now=$('fechaActual');if(now)now.textContent=new Date().toLocaleDateString('es-MX',{month:'long',year:'numeric'}).toUpperCase();
    $search?.addEventListener('input',render);
    $clear?.addEventListener('click',()=>{selected='todos';if($search)$search.value='';render();});
    document.querySelectorAll('.tm-v5-kpi').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.kpi||'todos';render();}));
    load();
 });
})();
