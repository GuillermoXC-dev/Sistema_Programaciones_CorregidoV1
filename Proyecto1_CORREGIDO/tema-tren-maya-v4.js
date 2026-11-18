/* Dashboard theme V4: actual latest operations from the existing read-only table.
   Does not alter original dashboard.js data loads or forms. */
(function(){
 'use strict';
 function dateLabel(raw){ if(!raw)return '—';const bits=String(raw).split('-');return bits.length===3?`${bits[2]}/${bits[1]}/${bits[0]}`:String(raw); }
 function cell(row,value){const td=document.createElement('td');td.textContent=value??'—';row.append(td);return td;}
 async function syncSummary(){
  const target=document.getElementById('tmResumenV4');if(!target)return;
  // The client is defined by the original dashboard script.
  if(typeof supabaseClient==='undefined') {target.replaceChildren();const tr=document.createElement('tr');const td=cell(tr,'No se pudo iniciar la conexión');td.colSpan=6;target.append(tr);return;}
  try {
    let q=supabaseClient.from('Programaciones').select('id,fecha,no_locomotora,origen,destino,estatus').order('fecha',{ascending:false}).limit(8);
    // Match the existing calendar filter when possible.
    if(typeof filtroActual!=='undefined' && filtroActual!=='todo' && typeof obtenerRangoFiltro==='function' && typeof fechaTextoLocal==='function'){
      const r=obtenerRangoFiltro(); if(r.inicio&&r.fin)q=q.gte('fecha',fechaTextoLocal(r.inicio)).lte('fecha',fechaTextoLocal(r.fin));
    }
    const {data,error}=await q;if(error)throw error;
    target.replaceChildren();
    if(!data||!data.length){const tr=document.createElement('tr');const td=cell(tr,'Sin operaciones registradas para el período seleccionado');td.colSpan=6;target.append(tr);return;}
    data.forEach(op=>{
       const tr=document.createElement('tr');
       cell(tr,dateLabel(op.fecha));cell(tr,op.no_locomotora||'—');cell(tr,op.origen||'—');cell(tr,op.destino||'—');cell(tr,op.estatus||'—');
       const td=document.createElement('td');const btn=document.createElement('button');btn.type='button';btn.textContent='Ver';btn.addEventListener('click',()=>{window.location.href='servicio-patio.html'});td.append(btn);tr.append(td);target.append(tr);
    });
  } catch(err){console.warn('Resumen TM:',err);target.replaceChildren();const tr=document.createElement('tr');const td=cell(tr,'No fue posible cargar el resumen. Comprueba la conexión.');td.colSpan=6;target.append(tr);}
 }
 document.addEventListener('DOMContentLoaded',()=>{
    const fecha=document.getElementById('fechaActual');
    if(fecha){fecha.textContent=new Date().toLocaleDateString('es-MX',{month:'long',year:'numeric'}).toUpperCase();}
    syncSummary(); ['filtroHoy','filtroSemana','filtroMes','filtroTodo'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(syncSummary,0)));
 });
})();
