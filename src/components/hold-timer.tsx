import { useEffect, useState } from "react";
export function HoldTimer({expiresAt,onExpire}:{expiresAt:number|undefined;onExpire:()=>void}){
 const [left,setLeft]=useState(()=>Math.max(0,(expiresAt??Date.now())-Date.now()));
 useEffect(()=>{const update=()=>{const remaining=Math.max(0,(expiresAt??Date.now())-Date.now());setLeft(remaining);if(expiresAt&&remaining===0)onExpire()};update();const timer=setInterval(update,1000);document.addEventListener("visibilitychange",update);window.addEventListener("focus",update);return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",update);window.removeEventListener("focus",update)}},[expiresAt,onExpire]);
 const seconds=Math.ceil(left/1000),blocks=Math.ceil(seconds/30);
 return <div className="border-[3px] border-ink bg-card p-4" role="timer" aria-label="Time remaining on your hold"><div className="flex justify-between gap-3 font-mono font-bold"><span>{expiresAt?"SEATS HELD":"CHOOSE YOUR SEATS"}</span>{expiresAt&&<span>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</span>}</div>{expiresAt&&<div className={`mt-3 grid grid-cols-20 gap-1 ${seconds<120?"timer-low":""}`}>{Array.from({length:20},(_,i)=><i key={i} className={`h-3 border-2 border-ink ${i<blocks?"bg-event":"bg-transparent"}`}/>)}</div>}</div>
}
