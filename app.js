/* DriveVault V2
   Architecture: API-ready repository + local fallback.
   Configure API_BASE or Supabase credentials in config.js if a production backend is available.
*/
const CONFIG={API_BASE:"",MAX_COMPARE:3};
const KEY="drivevault_db_v2";
const SESSION="drivevault_session_v2";
const seed=[
{id:1,make:"BMW",model:"M4 Competition",year:2024,price:89500,mileage:8200,fuel:"Petrol",trans:"Automatic",engine:"3.0L Twin-Turbo",hp:503,drive:"RWD",color:"Brooklyn Grey",location:"Beirut",seller:"DriveVault",image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",description:"A focused performance coupe with everyday usability.",featured:true},
{id:2,make:"Mercedes-Benz",model:"AMG GT 63",year:2025,price:184900,mileage:3100,fuel:"Petrol",trans:"Automatic",engine:"4.0L V8 Biturbo",hp:577,drive:"AWD",color:"Obsidian Black",location:"Beirut",seller:"DriveVault",image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",description:"Luxury grand touring with serious AMG performance.",featured:true},
{id:3,make:"Porsche",model:"911 Carrera S",year:2023,price:139900,mileage:12600,fuel:"Petrol",trans:"Automatic",engine:"3.0L Flat-6 Turbo",hp:443,drive:"RWD",color:"Guards Red",location:"Zahle",seller:"DriveVault",image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",description:"Iconic rear-engine sports car engineered for precision.",featured:true},
{id:4,make:"Toyota",model:"Land Cruiser",year:2024,price:74900,mileage:9700,fuel:"Diesel",trans:"Automatic",engine:"2.8L Turbo Diesel",hp:201,drive:"AWD",color:"White",location:"Tripoli",seller:"DriveVault",image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",description:"Durable all-terrain capability with modern comfort."},
{id:5,make:"Tesla",model:"Model 3 Performance",year:2025,price:57900,mileage:4400,fuel:"Electric",trans:"Automatic",engine:"Dual Motor",hp:510,drive:"AWD",color:"Pearl White",location:"Beirut",seller:"DriveVault",image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=85",description:"Instant electric performance and long-range practicality."},
{id:6,make:"Volvo",model:"XC60 Recharge",year:2024,price:66900,mileage:7600,fuel:"Hybrid",trans:"Automatic",engine:"2.0L Plug-in Hybrid",hp:455,drive:"AWD",color:"Crystal White",location:"Jounieh",seller:"DriveVault",image:"https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1000&q=85",description:"Refined Scandinavian SUV with plug-in hybrid power."}
];

const $=s=>document.querySelector(s);
const state={cars:[],compare:[],favorites:new Set(),user:null};
function verify(condition,message){if(!condition)throw new Error("Verification failed: "+message);return true}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function loadLocal(){try{return JSON.parse(localStorage.getItem(KEY))||seed}catch{return seed}}
function saveLocal(){localStorage.setItem(KEY,JSON.stringify(state.cars))}
async function api(path,options={}){
  if(!CONFIG.API_BASE)throw new Error("API not configured");
  const r=await fetch(CONFIG.API_BASE+path,{headers:{"Content-Type":"application/json"},...options});
  verify(r.ok,`API ${r.status}`);return r.json()
}
/* Repository: tries the real API first, then deliberately falls back to local persistence. */
const repo={
 async list(){try{if(CONFIG.API_BASE)return await api("/cars");}catch(e){console.warn(e.message)}return loadLocal()},
 async create(car){try{if(CONFIG.API_BASE)return await api("/cars",{method:"POST",body:JSON.stringify(car)})}catch(e){console.warn(e.message)}car.id=Date.now();state.cars.push(car);saveLocal();return car},
 async remove(id){try{if(CONFIG.API_BASE)return await api("/cars/"+id,{method:"DELETE"})}catch(e){console.warn(e.message)}state.cars=state.cars.filter(c=>c.id!==id);saveLocal()}
};

function currentUser(){try{return JSON.parse(localStorage.getItem(SESSION))}catch{return null}}
function filtered(){
 const q=$("#search").value.toLowerCase().trim(),make=$("#make").value,fuel=$("#fuel").value,trans=$("#trans").value,max=Number($("#maxPrice").value)||Infinity,sort=$("#sort").value;
 let a=state.cars.filter(c=>(!q||`${c.make} ${c.model} ${c.year} ${c.location}`.toLowerCase().includes(q))&&(!make||c.make===make)&&(!fuel||c.fuel===fuel)&&(!trans||c.trans===trans)&&c.price<=max);
 if(sort==="priceAsc")a.sort((x,y)=>x.price-y.price);if(sort==="priceDesc")a.sort((x,y)=>y.price-x.price);if(sort==="yearDesc")a.sort((x,y)=>y.year-x.year);if(sort==="featured")a.sort((x,y)=>Number(y.featured)-Number(x.featured));return a
}
function populateMakes(){const s=$("#make"),old=s.value;[...new Set(state.cars.map(c=>c.make))].sort().forEach(m=>s.add(new Option(m,m)));s.value=old}
function isFav(id){return state.favorites.has(id)}
function render(){
 try{
  verify(Array.isArray(state.cars),"cars must be an array");verify($("#cars"),"car grid missing");
  const a=filtered();$("#resultCount").textContent=`${a.length} vehicle${a.length===1?"":"s"}`;$("#heroCount").textContent=state.cars.length;
  $("#cars").innerHTML=a.length?a.map(c=>`<article class="card"><div class="carImage"><img src="${safe(c.image)}" alt="${safe(c.make+" "+c.model)}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80'"><button class="fav ${isFav(c.id)?"on":""}" onclick="toggleFav(${c.id})">${isFav(c.id)?"♥":"♡"}</button></div><div class="cardBody"><span class="tag">${safe(c.make.toUpperCase())}</span><h3>${safe(c.model)}</h3><div class="specs"><span>${c.year}</span><span>${Number(c.mileage).toLocaleString()} km</span><span>${safe(c.trans)}</span><span>${safe(c.fuel)}</span><span>${safe(c.location)}</span></div><div class="price">$${Number(c.price).toLocaleString()}</div><div class="actions"><button class="view" onclick="details(${c.id})">View details</button><button onclick="toggleCompare(${c.id})">${state.compare.includes(c.id)?"✓ Compared":"Compare"}</button></div></div></article>`).join(""):"<div class='card'><div class='cardBody'><h3>No matching cars</h3><p>Try another filter or search term.</p></div></div>";
  $("#compareCount").textContent=state.compare.length;renderCompare()
 }catch(e){console.error(e);fallbackRender(e)}
}
function fallbackRender(e){$("#cars").innerHTML=`<div class="card"><div class="cardBody"><h3>Inventory could not render</h3><p>${safe(e.message)}. The recovery renderer is active.</p><button class="primaryBtn" onclick="boot()">Retry safely</button></div></div>`}
function safe(v){return String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[x]))}
function details(id){
 const c=state.cars.find(x=>x.id===id);if(!c)return showToast("Vehicle no longer exists");
 $("#modalBody").innerHTML=`<div class="detailImage"><img src="${safe(c.image)}" onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80'"></div><p class="eyebrow">${safe(c.make)}</p><h2>${safe(c.model)}</h2><p>${safe(c.description)}</p><div class="detailSpecs">${[["Year",c.year],["Price","$"+Number(c.price).toLocaleString()],["Mileage",Number(c.mileage).toLocaleString()+" km"],["Engine",c.engine],["Power",c.hp+" hp"],["Drive",c.drive],["Fuel",c.fuel],["Transmission",c.trans],["Color",c.color],["Location",c.location]].map(x=>`<div><small>${safe(x[0])}</small><b>${safe(x[1])}</b></div>`).join("")}</div><button class="primaryBtn" onclick="contactSeller(${c.id})">Contact seller</button>`;
 $("#modal").classList.remove("hidden")
}
function contactSeller(id){const c=state.cars.find(x=>x.id===id);const u=state.user;if(!u){$("#modal").classList.add("hidden");openAuth();return}showToast(`Inquiry started for ${c.make} ${c.model}`);alert(`Message to ${c.seller}: Hello, I am interested in the ${c.year} ${c.make} ${c.model}.`)}
function toggleFav(id){if(!state.user){openAuth();return}state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);localStorage.setItem("drivevault_favorites",JSON.stringify([...state.favorites]));render()}
function toggleCompare(id){if(state.compare.includes(id))state.compare=state.compare.filter(x=>x!==id);else if(state.compare.length<CONFIG.MAX_COMPARE)state.compare.push(id);else return showToast("Maximum 3 cars");render();if(state.compare.length)$("#compare").scrollIntoView({behavior:"smooth"})}
function renderCompare(){
 const selected=state.compare.map(id=>state.cars.find(c=>c.id===id)).filter(Boolean),box=$("#compareBox");if(!selected.length){box.textContent="Choose up to 3 vehicles.";return}
 const rows=[["Year","year"],["Price","price"],["Mileage","mileage"],["Engine","engine"],["Power","hp"],["Fuel","fuel"],["Transmission","trans"],["Drive","drive"]];
 let html=`<div class="compareGrid"><b>Specification</b>${selected.map(c=>`<b>${safe(c.make+" "+c.model)}</b>`).join("")}${selected.length<3?`<span></span>`.repeat(3-selected.length):""}`;
 rows.forEach(([label,k])=>{html+=`<span>${label}</span>`+selected.map(c=>`<span>${k==="price"?"$"+Number(c[k]).toLocaleString():k==="mileage"?Number(c[k]).toLocaleString()+" km":k==="hp"?c[k]+" hp":safe(c[k])}</span>`).join("")+(selected.length<3?"<span></span>".repeat(3-selected.length):"")});box.innerHTML=html+"</div>"
}
function openAuth(){const u=state.user;$("#authBody").innerHTML=u?`<h2>Account</h2><p>Signed in as <b>${safe(u.email)}</b></p><button class="primaryBtn" onclick="logout()">Log out</button>`:`<h2>Login / Create account</h2><form id="authForm" class="formGrid"><input name="name" placeholder="Name" required><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password" required class="full"><button class="primaryBtn full">Continue</button></form>`;$("#authModal").classList.remove("hidden")}
function logout(){state.user=null;localStorage.removeItem(SESSION);showToast("Logged out");$("#authModal").classList.add("hidden");render()}
function openSell(){if(!state.user)return openAuth();$("#sellModal").classList.remove("hidden")}
function admin(){
 const body=$("#adminBody"),isAdmin=state.user?.role==="admin";
 if(!isAdmin){body.innerHTML=`<h2>Admin access</h2><p>Demo admin account: <b>admin@drivevault.local</b></p><form id="adminLogin" class="formGrid"><input name="email" value="admin@drivevault.local"><input name="password" type="password" placeholder="Password" required><button class="primaryBtn full">Sign in</button></form>`}
 else body.innerHTML=`<h2>Admin dashboard</h2><p>${state.cars.length} listings in inventory.</p><div class="adminList">${state.cars.map(c=>`<div class="adminRow"><span>${safe(c.year+" "+c.make+" "+c.model)}</span><button class="outlineBtn danger" onclick="deleteCar(${c.id})">Delete</button></div>`).join("")}</div>`;
 $("#adminModal").classList.remove("hidden")
}
async function deleteCar(id){if(!confirm("Delete this listing?"))return;await repo.remove(id);state.cars=await repo.list();populateMakes();render();admin()}
async function boot(){
 try{
  state.cars=await repo.list();verify(state.cars.length>0,"inventory empty");verify(state.cars.every(c=>c.id&&c.make&&c.model&&Number.isFinite(Number(c.price))),"invalid listing data");
  state.user=currentUser();try{state.favorites=new Set(JSON.parse(localStorage.getItem("drivevault_favorites")||"[]"))}catch{state.favorites=new Set()}
  populateMakes();render();runVerificationSuite()
 }catch(e){console.error(e);state.cars=seed;render()}
}
function runVerificationSuite(){
 const tests=[
  ["DOM mounts",()=>verify($("#cars")&&$("#compareBox")&&$("#modal"),"required DOM missing")],
  ["Inventory schema",()=>verify(state.cars.every(c=>c.id&&c.make&&c.model&&c.price!==undefined),"bad car record")],
  ["Search pipeline",()=>verify(Array.isArray(filtered()),"filter did not return array")],
  ["Compare limit",()=>verify(CONFIG.MAX_COMPARE===3,"compare limit incorrect")],
  ["Persistence",()=>{const x=localStorage.getItem(KEY);verify(!!x,"database fallback not persisted")}],
  ["Theme engine",()=>{document.body.classList.add("light");verify(document.body.classList.contains("light"),"light theme failed");document.body.classList.remove("light")}]
 ];
 const failures=[];tests.forEach(([n,fn])=>{try{fn()}catch(e){failures.push(n);console.error(n,e)}});console.log(`DriveVault verification: ${tests.length-failures.length}/${tests.length} passed`,failures);if(failures.length)showToast(`${failures.length} verification check(s) need attention`)
}
document.querySelectorAll(".filters input,.filters select").forEach(x=>x.addEventListener("input",render));
$("#themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("drivevault_theme",document.body.classList.contains("light")?"light":"dark")};
$("#authBtn").onclick=openAuth;$("#sellBtn").onclick=openSell;$("#adminBtn").onclick=admin;$("#closeModal").onclick=()=>$("#modal").classList.add("hidden");
document.addEventListener("click",e=>{const id=e.target.dataset.close;if(id)$("#"+id).classList.add("hidden")});
document.addEventListener("submit",async e=>{
 if(e.target.id==="authForm"){e.preventDefault();const f=new FormData(e.target);state.user={name:f.get("name"),email:f.get("email")};localStorage.setItem(SESSION,JSON.stringify(state.user));$("#authModal").classList.add("hidden");$("#authBtn").textContent="Account";showToast("Account ready");render()}
 if(e.target.id==="adminLogin"){e.preventDefault();const f=new FormData(e.target);if(f.get("email")==="admin@drivevault.local"&&f.get("password")==="admin123"){state.user={email:f.get("email"),role:"admin"};localStorage.setItem(SESSION,JSON.stringify(state.user));admin()}else showToast("Invalid demo admin credentials")}
 if(e.target.id==="sellForm"){e.preventDefault();const f=new FormData(e.target);const c=Object.fromEntries(f.entries());c.year=Number(c.year);c.price=Number(c.price);c.mileage=Number(c.mileage);c.hp=0;c.engine="Not specified";c.drive="Not specified";c.color="Not specified";c.seller=state.user.email;c.featured=false;c.image=c.image||"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80";c.description=c.description||"Seller listing.";await repo.create(c);state.cars=await repo.list();populateMakes();render();$("#sellModal").classList.add("hidden");e.target.reset();showToast("Listing published")}
});
if(localStorage.getItem("drivevault_theme")==="light")document.body.classList.add("light");
boot();
