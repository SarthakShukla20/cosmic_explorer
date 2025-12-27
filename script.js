document.addEventListener("DOMContentLoaded", () => {

  // PAGE NAVIGATION
  const navBtns = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showPage(btn.dataset.show);
    });
  });

  // HOME PAGE "SEE GALLERY" BUTTON 
const goGalleryBtn = document.getElementById("go-gallery");
if (goGalleryBtn) {
  goGalleryBtn.addEventListener("click", () => {
    const navTarget = document.querySelector("[data-show='gallery']");
    if (navTarget) navTarget.click();
  });
}

// HOME PAGE "START QUIZ" BUTTON 
const startQuizBtn = document.getElementById("start-quiz");
if (startQuizBtn) {
  startQuizBtn.addEventListener("click", () => {
    const navTarget = document.querySelector("[data-show='quiz']");
    if (navTarget) navTarget.click();
  });
}

function showPage(id) {
    pages.forEach(p => p.classList.remove("visible"));
    const page = document.getElementById(id);
    if (page) page.classList.add("visible");
    if (id === "asteroids") loadAsteroids();
    if (id === "iss") loadISSData();
    if (id === "spacex") loadSpaceX();
  }

  showPage("home");

  // ARTICLES
  fetch("./articles.json")
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("article-list");
      data.articles.forEach(a => {
        const item = document.createElement("article");
        item.innerHTML = `
          <h3>${a.title}</h3>
          <p>${a.excerpt}</p>
          <a href="#" class="btn ghost" data-full="${a.id}">Read More</a>
        `;
        list.appendChild(item);
      });

      list.addEventListener("click", e => {
        if (e.target.dataset.full) {
          const id = e.target.dataset.full;
          const found = data.articles.find(a => a.id == id);
          alert(found.title + "\n\n" + found.content);
        }
      });
    });

  // GALLERY
  const gallery = document.getElementById("gallery-grid");

  for (let i = 1; i <= 8; i++) {
    const img = document.createElement("img");
    img.src = `./assets/gal${i}.jpg`;
    img.onerror = () => img.src = "./assets/placeholder.jpg";
    gallery.appendChild(img);
  }

  // NASA API KEY
  const NASA_API_KEY = "VGqgYEzvg0v0VPTDdTbVTijA0GXUObKV1npIdVbi";

  // APOD
  fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`)
    .then(r => r.json())
    .then(data => {
      document.getElementById("apod-img").src =
        data.url || "./assets/placeholder.jpg";

      document.getElementById("apod-title").textContent = data.title;
      document.getElementById("apod-desc").textContent = data.explanation;
      document.getElementById("apod-date").textContent = data.date;
    });

  // SPACE EVENTS 
  const events = [
    { date: "2025-12-14", title: "Geminids Meteor Shower Peak" },
    { date: "2026-04-08", title: "Total Solar Eclipse (USA)" },
    { date: "2025-11-30", title: "ISS Visible Over India" },
    { date: "2025-10-02", title: "Venus at Greatest Eastern Elongation" }
  ];

  const eventsList = document.getElementById("events-list");
  eventsList.innerHTML = "";

  events.forEach(ev => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${ev.title}</strong> • <span>${ev.date}</span>`;
    eventsList.appendChild(li);
  });

  // QUIZ
  let quizData = [];
  let currentQ = 0;
  let score = 0;

  fetch("./quizz.json")
    .then(r => r.json())
    .then(data => {
      quizData = data.questions;
      showQuestion();
    });

  function showQuestion() {
    const q = quizData[currentQ];
    if (!q) {
      document.getElementById("quiz-question").textContent =
        `Quiz finished! Score: ${score}/${quizData.length}`;
      document.getElementById("quiz-options").innerHTML = "";
      return;
    }

    document.getElementById("quiz-question").textContent = q.q;

    const opts = document.getElementById("quiz-options");
    opts.innerHTML = "";

    q.options.forEach(o => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = o;

      div.onclick = () => {
        if (o === q.answer) {
          div.style.borderColor = "lightgreen";
          score++;
        } else {
          div.style.borderColor = "red";
        }

        [...opts.children].forEach(c => (c.style.pointerEvents = "none"));
        document.getElementById("quiz-score").textContent = `Score: ${score}`;
      };

      opts.appendChild(div);
    });
  }

  document.getElementById("next-q").onclick = () => {
    currentQ++;
    showQuestion();
  };

  document.getElementById("start-quiz").onclick = () => {
    document.querySelector("[data-show='quiz']").click();
  };

  // ASTEROIDS
  function loadAsteroids() {
    const today = new Date().toISOString().split("T")[0];

    fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`)
      .then(r => r.json())
      .then(data => {
        const list = document.getElementById("asteroid-list");
        list.innerHTML = "";

        (data.near_earth_objects[today] || []).forEach(a => {
          const el = document.createElement("article");
          el.innerHTML = `
            <h3>${a.name}</h3>
            <p>Diameter: ${a.estimated_diameter.meters.estimated_diameter_max.toFixed(2)} m</p>
            <p>Hazardous: ${a.is_potentially_hazardous_asteroid ? "YES" : "NO"}</p>
          `;
          list.appendChild(el);
        });
      });
  }

  // ISS TRACKER
  function loadISSData() {
    fetch("https://api.wheretheiss.at/v1/satellites/25544")
      .then(r => r.json())
      .then(data => {
        document.getElementById("iss-data").innerHTML = `
          <p><strong>Latitude:</strong> ${data.latitude.toFixed(2)}</p>
          <p><strong>Longitude:</strong> ${data.longitude.toFixed(2)}</p>
          <p><strong>Altitude:</strong> ${data.altitude.toFixed(2)} km</p>
          <p><strong>Velocity:</strong> ${data.velocity.toFixed(2)} km/h</p>
        `;
      });
  }

  // SPACEX
  function loadSpaceX() {
    fetch("https://api.spacexdata.com/v4/launches/next")
      .then(r => r.json())
      .then(data => {
        const date = new Date(data.date_utc);

        document.getElementById("spacex-launch").innerHTML = `
          <p><strong>Mission:</strong> ${data.name}</p>
          <p><strong>Launch Date:</strong> ${date.toLocaleString()}</p>
          <p>${data.details || "No details yet."}</p>
        `;
      });
  }

});

   // 3D PLANET EXPLORER 
function initThree() {
  const container = document.getElementById("three-container");
  if (!container) return;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 0, 3.5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.7);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 3, 5);
  scene.add(hemi, dir);

  // Planet
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("./assets/earth.jpg");

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  scene.add(sphere);

  // Controls (Rotation by dragging)
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotX = 0, rotY = 0;

  renderer.domElement.addEventListener("pointerdown", e => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  window.addEventListener("pointermove", e => {
    if (!isDragging) return;

    const dx = (e.clientX - prevX) * 0.01;
    const dy = (e.clientY - prevY) * 0.01;

    rotY += dx;
    rotX += dy;

    prevX = e.clientX;
    prevY = e.clientY;
  });

  // Zoom
  container.addEventListener("wheel", e => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.002;
    camera.position.z = Math.max(1.3, Math.min(6, camera.position.z));
  }, { passive: false });

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.y += 0.002;

    sphere.rotation.x += rotX * 0.1;
    sphere.rotation.y += rotY * 0.1;

    rotX *= 0.93;
    rotY *= 0.93;

    renderer.render(scene, camera);
  }

  animate();
}

document.querySelector('[data-show="explorer"]').addEventListener("click", () => {
  setTimeout(initThree, 100);
});
