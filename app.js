const DB_KEY="drivevault_cars_v1";
const seed=[
{id:1,make:"BMW",model:"M4 Competition",year:2024,price:89500,mileage:8200,fuel:"Petrol",trans:"Automatic",engine:"3.0L Twin-Turbo",hp:503,drive:"RWD",color:"Brooklyn Grey",desc:"A focused performance coupe with everyday usability.",featured:true},
{id:2,make:"Mercedes-Benz",model:"AMG GT 63",year:2025,price:184900,mileage:3100,fuel:"Petrol",trans:"Automatic",engine:"4.0L V8 Biturbo",hp:577,drive:"AWD",color:"Obsidian Black",desc:"Luxury grand touring with serious AMG performance.",featured:true},
{id:3,make:"Porsche",model:"911 Carrera S",year:2023,price:139900,mileage:12600,fuel:"Petrol",trans:"Automatic",engine:"3.0L Flat-6 Turbo",hp:443,drive:"RWD",color:"Guards Red",desc:"Iconic rear-engine sports car engineered for precision.",featured:true},
{id:4,make:"Toyota",model:"Land Cruiser",year:2024,price:74900,mileage:9700,fuel:"Diesel",trans:"Automatic",engine:"2.8L Turbo Diesel",hp:201,drive:"AWD",color:"White",desc:"Durable all-terrain capability with modern comfort."},
{id:5,make:"Tesla",model:"Model 3 Performance",year:2025,price:57900,mileage:4400,fuel:"Electric",trans:"Automatic",engine:"Dual Motor",hp:510,drive:"AWD",color:"Pearl White",desc:"Instant electric performance and long-range practicality."},
{id:6,make:"Volvo",model:"XC60 Recharge",year:2024,price:66900,mileage:7600,fuel:"Hybrid",trans:"Automatic",engine:"2.0L Plug-in Hybrid",hp:455,drive:"AWD",color:"Crystal White",desc:"Refined Scandinavian SUV with plug-in hybrid power."}
];
let cars=JSON.parse(localStorage.getItem(DB_KEY)||"null")||seed;
let compareIds=[];

function verify(condition,message){
  if(!condition) throw new Error("DriveVault verification failed: "+message);
  return true;
}
function persist(){localStorage.setItem(DB_KEY,JSON.stringify(cars))}
function populateMakes(){
  const s=document.querySelector("#make");
  [...new Set(cars.map(c=>c.make))].sort().forEach(m=>s.add(new Option(m,m)));
}
function filtered(){
  const q=document.querySelector("#search").value.toLowerCase().trim(),make=document.querySelector("#make").value,fuel=document.querySelector("#fuel").value,trans=document.querySelector("#trans").value,sort=document.querySelector("#sort").value;
  let out=cars.filter(c=>(!q||`${c.make} ${c.model} ${c.year}`.toLowerCase().includes(q))&&(!make||c.make===make)&&(!fuel||c.fuel===fuel)&&(!trans||c.trans===trans));
  if(sort==="priceAsc")out.sort((a,b)=>a.price-b.price); if(sort==="priceDesc")out.sort((a,b)=>b.price-a.price); if(sort==="yearDesc")out.sort((a,b)=>b.year-a.year); if(sort==="featured")out.sort((a,b)=>Number(b.featured)-Number(a.featured));
  return out;
}
function render(){
  try{
    const out=filtered(),grid=document.querySelector("#cars");
    verify(grid,"car grid missing");
    grid.innerHTML=out.map(c=>`<article class="card">
      <div class="carImg">◈</div><div class="cardBody"><span class="tag">${c.make.toUpperCase()}</span><h3>${c.model}</h3>
      <div class="specs"><span>${c.year}</span><span>${c.mileage.toLocaleString()} km</span><span>${c.trans}</span><span>${c.fuel}</span></div>
      <div class="price">$${c.price.toLocaleString()}</div><div class="actions"><button class="view" onclick="details(${c.id})">View details</button><button onclick="toggleCompare(${c.id})">${compareIds.includes(c.id)?"✓ Compared":"Compare"}</button></div></div></article>`).join("")||`<p>No cars match your search.</p>`;
    document.querySelector("#resultCount").textContent=`${out.length} vehicle${out.length===1?"":"s"}`;
    renderCompare();
  }catch(e){console.error(e); fallbackRender()}
}
function fallbackRender(){
  const grid=document.querySelector("#cars");
  grid.innerHTML=`<div class="card"><div class="cardBody"><h3>Inventory temporarily unavailable</h3><p>Reloading the local database…</p><button class="view" onclick="location.reload()">Retry</button></div></div>`;
}
function details(id){
  const c=cars.find(x=>x.id===id); if(!c)return;
  document.querySelector("#modalBody").innerHTML=`<div class="detailHero">◈</div><p class="eyebrow">${c.make}</p><h2>${c.model}</h2><p>${c.desc}</p><div class="detailSpecs">
  ${[["Year",c.year],["Price","$"+c.price.toLocaleString()],["Mileage",c.mileage.toLocaleString()+" km"],["Engine",c.engine],["Power",c.hp+" hp"],["Drive",c.drive],["Fuel",c.fuel],["Color",c.color]].map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join("")}</div>`;
  document.querySelector("#modal").classList.remove("hidden");
}
function toggleCompare(id){
  if(compareIds.includes(id))compareIds=compareIds.filter(x=>x!==id);
  else if(compareIds.length<2)compareIds.push(id);
  else alert("Compare supports up to 2 cars.");
  render();
}
function renderCompare(){
  const box=document.querySelector("#compareBox"), selected=compareIds.map(id=>cars.find(c=>c.id===id)).filter(Boolean);
  if(!selected.length){box.textContent="Select up to 2 cars using “Compare”.";return}
  const rows=[["Make","make"],["Model","model"],["Year","year"],["Price","price"],["Mileage","mileage"],["Engine","engine"],["Power","hp"],["Fuel","fuel"],["Transmission","trans"],["Drive","drive"]];
  box.innerHTML=`<div class="compareGrid"><b>Specification</b>${selected.map(c=>`<b>${c.make} ${c.model}</b>`).join("")}${rows.map(([label,key])=>`<span>${label}</span>${selected.map(c=>`<span>${key==="price"?"$"+c[key].toLocaleString():key==="mileage"?c[key].toLocaleString()+" km":key==="hp"?c[key]+" hp":c[key]}</span>`).join("")}`).join("")}</div>`;
}
document.querySelectorAll(".controls input,.controls select").forEach(x=>x.addEventListener("input",render));
document.querySelector("#closeModal").onclick=()=>document.querySelector("#modal").classList.add("hidden");
document.querySelector("#modal").addEventListener("click",e=>{if(e.target.id==="modal")e.currentTarget.classList.add("hidden")});
document.querySelector("#themeBtn").onclick=()=>document.body.classList.toggle("light");
populateMakes();render();

// Verification checks run on startup and intentionally fail over to a safe renderer.
try{verify(Array.isArray(cars)&&cars.length>0,"database is empty");verify(cars.every(c=>c.id&&c.make&&c.model&&c.price!==undefined),"invalid car record");verify(document.querySelector("#cars"),"UI mount point missing")}catch(e){console.error(e)}
