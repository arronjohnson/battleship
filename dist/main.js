(()=>{"use strict";class e{static SIZES={carrier:5,battleship:4,cruiser:3,submarine:3,destroyer:2};constructor(e){this.length=e,this.hitCount=0}hit(){this.hitCount++}isSunk(){return this.hitCount===this.length}}class t{static SIZE=10;constructor(){this.grid=new Array(t.SIZE).fill(null).map((()=>new Array(t.SIZE).fill(null))),this.placedShips=[]}static#e(e,a){return e>=0&&e<t.SIZE&&a>=0&&a<t.SIZE}static#t(a,r,n,i,s){if(!t.#e(n,i))return!1;if((s?i:n)>t.SIZE-r)return!1;for(let o=-1;o<=r;o++)for(let r=-1;r<=1;r++){const d=n+(s?r:o),c=i+(s?o:r);if(t.#e(d,c)&&a[c][d]instanceof e)return!1}return!0}placeShip(a,[r,n],i){if(!t.#t(this.grid,a,r,n,i))return!1;const s=new e(a);for(let e=0;e<a;e++)i?this.grid[n+e][r]=s:this.grid[n][r+e]=s;return this.placedShips.push(s),!0}static#a(){return[Math.floor(Math.random()*t.SIZE),Math.floor(Math.random()*t.SIZE)]}placeShipsRandomly(){const a=Object.values(e.SIZES);let r=0;for(;r<a.length;){const e=1===Math.floor(2*Math.random());this.placeShip(a[r],t.#a(),e)&&r++}}receiveAttack([t,a]){const r=this.grid[a][t];return"hit"!==r&&"miss"!==r&&(r instanceof e?(r.hit(),this.grid[a][t]="hit"):this.grid[a][t]="miss",!0)}receiveComputerAttack(){if(1===Math.floor(3*Math.random())){const e=this.#r();if(e.length>0)return this.receiveAttack(e.pop())}let e=!1;for(;!e;)e=this.receiveAttack(t.#a());return!0}#r(){const a=[];for(let r=0;r<t.SIZE;r++)for(let n=0;n<t.SIZE;n++){const t=this.grid[n][r];t instanceof e&&t.hitCount>0&&a.push([r,n])}return a}#n(){const a=[];for(let e=0;e<t.SIZE;e++)for(let r=0;r<t.SIZE;r++)"hit"===this.grid[r][e]&&[{x:e+1,y:r},{x:e,y:r+1},{x:e-1,y:r},{x:e,y:r-1}].forEach((e=>{const[r,n]=[e.x,e.y];if(t.#e(r,n)){const e=this.grid[n][r];"hit"!==e&&"miss"!==e&&a.push({x:r,y:n})}}));return a.map((t=>this.grid[t.y][t.x]instanceof e)).some((e=>!0===e))?a:[]}allShipsSunk(){return this.placedShips.every((e=>e.isSunk()))}}class a{constructor(e){this.name=e,this.gameboard=new t}resetBoard(){this.gameboard=new t}}const r=new class{constructor(){this.p1=new a("player"),this.p2=new a("computer"),this.p2.gameboard.placeShipsRandomly()}placePlayerShip(e,t,a,r){return this.p1.gameboard.placeShip(e,[t,a],r)}placePlayerShipsRandomly(){this.p1.resetBoard(),this.p1.gameboard.placeShipsRandomly()}areShipsPlaced(){return 5===this.p1.gameboard.placedShips.length}isGameOver(){return this.p1.gameboard.allShipsSunk()||this.p2.gameboard.allShipsSunk()}getWinner(){return this.p2.gameboard.allShipsSunk()?"player":"computer"}playerTurn(e,t){return this.p2.gameboard.receiveAttack([e,t])}computerTurn(){return this.p1.gameboard.receiveComputerAttack()}reset(){this.p1.resetBoard(),this.p2.resetBoard(),this.p2.gameboard.placeShipsRandomly()}},n=document.querySelector(".js-random-button"),i=document.querySelector(".js-restart-button"),s=document.querySelector(".js-rotate-button"),o=document.querySelector(".js-start-button"),d=document.getElementById("js-gameboard-container-p1"),c=document.getElementById("js-gameboard-container-p2"),l=document.querySelector(".js-dialog"),h=l.querySelector(".js-dialog__heading"),p=document.querySelector(".js-ship-placement");function u(){r.reset(),m(),g(),S()}function m(){const e=document.getElementById("js-ship-container");p.classList.toggle("ship-placement--hidden"),c.classList.toggle("gameboard-container--hidden"),e?.remove()}function g(){const t=document.createElement("div");t.classList="ship-container",t.id="js-ship-container";const a=Object.entries(e.SIZES);for(let e=0;e<a.length;e++){const[n,i]=a[e],s=document.createElement("div");s.classList=`ship ship--${n} js-ship`,s.id=`js-ship-${n}`,s.dataset.index=0,s.dataset.length=i,s.dataset.orientation="vertical",s.setAttribute("draggable",!0),(r=s).addEventListener("mousedown",(e=>function(e){const t=e.parentNode;t&&(t.dataset.index=e.dataset.index)}(e.target))),r.addEventListener("dragstart",(e=>function(e){e.dataTransfer.setData("text",e.target.id)}(e)));for(let e=0;e<i;e++){const t=document.createElement("div");t.classList="ship__cell",t.dataset.index=e,s.appendChild(t)}t.appendChild(s)}var r;p.appendChild(t)}function S(){!function(){const e=document.getElementById("js-gameboard-p1"),t=document.getElementById("js-gameboard-p2");e?.remove(),t?.remove()}(),d.appendChild(f(r.p1,1)),c.appendChild(f(r.p2,2)),function(){const e=document.querySelectorAll("#js-gameboard-p2 > .js-gameboard__cell"),t=document.querySelectorAll("#js-gameboard-p1 > .js-gameboard__cell");e.forEach((e=>e.addEventListener("click",(e=>{return t=e.target,void(r.playerTurn(t.dataset.x,t.dataset.y)&&(r.computerTurn(),S(),r.isGameOver()&&("player"===r.getWinner()?(h.classList.add("dialog__heading--win"),h.textContent="You won the game!"):(h.classList.remove("dialog__heading--win"),h.textContent="You lost the game..."),l.showModal(),i.blur())));var t})))),t.forEach((e=>{e.addEventListener("dragover",(e=>e.preventDefault())),e.addEventListener("drop",(e=>function(e){const t=e.dataTransfer.getData("text"),a=document.getElementById(t),n=Number(a.dataset.length),i="vertical"===a.dataset.orientation,s=Number(a.dataset.index),o=Number(e.target.dataset.x)-(i?0:s),d=Number(e.target.dataset.y)-(i?s:0);r.placePlayerShip(n,o,d,i)&&(a.parentElement.removeChild(a),S())}(e)))}))}()}function f(e,a){const r=document.createElement("div");r.classList=`gameboard gameboard--p${a}`,r.id=`js-gameboard-p${a}`;for(let a=0;a<t.SIZE;a++)for(let n=0;n<t.SIZE;n++){const t=document.createElement("div");t.classList="gameboard__cell js-gameboard__cell",t.dataset.x=n,t.dataset.y=a;const i=e.gameboard.grid[a][n];i&&("hit"===i||"miss"===i?t.classList.add(`gameboard__cell--${i}`):"player"===e.name&&t.classList.add("gameboard__cell--ship")),r.append(t)}return r}l.addEventListener("cancel",u),n.addEventListener("click",(function(){document.getElementById("js-ship-container").innerHTML="",r.placePlayerShipsRandomly(),S()})),i.addEventListener("click",(function(){l.close(),u()})),s.addEventListener("click",(function(){const e=document.getElementById("js-ship-container"),t=e.querySelectorAll(".js-ship");e.classList.toggle("ship-container--horizontal"),t.forEach((e=>{e.classList.toggle("ship--horizontal");const{orientation:t}=e.dataset;e.dataset.orientation="vertical"===t?"horizontal":"vertical"}))})),o.addEventListener("click",(function(){r.areShipsPlaced()?m():alert("You must finish placing your ships first.")})),g(),S()})();