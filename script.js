// ===============================
// WATSON XD PANEL
// Premium Website JavaScript
// ===============================

// Sticky Header
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.style.background = "rgba(7,11,22,.95)";
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
    } else {
        header.style.background = "rgba(7,11,22,.75)";
        header.style.boxShadow = "none";
    }
});

// Counter Animation
const counters = document.querySelectorAll(".counter");
const speed = 200;
counters.forEach(counter=>{
    const update = ()=>{
        const target = +counter.getAttribute("data-target");
        const count = +counter.innerText;
        const inc = target / speed;
        if(count < target){
            counter.innerText = Math.ceil(count + inc);
            setTimeout(update,10);
        }else{
            counter.innerText = target;
        }
    };
    update();
});

// FAQ
document.querySelectorAll(".faq-box").forEach(box=>{
    box.addEventListener("click",()=>{
        box.classList.toggle("active");
    });
});

// Scroll To Top
const scrollBtn=document.querySelector(".scrollTop");
window.addEventListener("scroll",()=>{
    if(window.scrollY>500){
        scrollBtn.classList.add("show");
    }else{
        scrollBtn.classList.remove("show");
    }
});
if(scrollBtn){
    scrollBtn.onclick=()=>{
        window.scrollTo({top:0,behavior:"smooth"});
    };
}

// Reveal Animation
const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});
document.querySelectorAll(".plan,.feature-card,.review-card,.vps-card").forEach(el=>{
    el.classList.add("hidden");
    observer.observe(el);
});

// Active Navigation
const sections=document.querySelectorAll("section");
const navLinks=document.querySelectorAll("nav a");
window.addEventListener("scroll",()=>{
    let current="";
    sections.forEach(section=>{
        const top=section.offsetTop-150;
        if(pageYOffset>=top){
            current=section.getAttribute("id");
        }
    });
    navLinks.forEach(link=>{
        link.classList.remove("active");
        if(link.getAttribute("href")=="#"+current){
            link.classList.add("active");
        }
    });
});

// Loading Screen
window.onload=()=>{
    const loader=document.querySelector(".loader");
    if(loader){
        loader.style.opacity="0";
        setTimeout(()=>{loader.style.display="none";},500);
    }
};

// Floating Effect
const panel=document.querySelector(".hero-right img");
if(panel){
    let x=0;
    setInterval(()=>{x++;panel.style.transform=`translateY(${Math.sin(x/20)*10}px)`;},40);
}

// Mouse Glow
document.addEventListener("mousemove",(e)=>{
    const glow=document.querySelector(".background");
    if(glow){
        glow.style.backgroundPosition=`${e.clientX/25}px ${e.clientY/25}px`;
    }
});

// Current Year
const year=document.getElementById("year");
if(year){year.innerHTML=new Date().getFullYear();}
