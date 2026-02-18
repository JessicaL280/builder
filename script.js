/* ---------------------------
   BIG BOX DRAG & RESIZE
---------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("moveBox");
  const dragHeader = document.getElementById("dragHeader");
  const resizeHandle = document.getElementById("resizeHandle");

  if (box && dragHeader && resizeHandle) {
    let isDragging = false, isResizing = false, offsetX, offsetY;

    dragHeader.onmousedown = (e) => {
      isDragging = true;
      offsetX = e.clientX - box.offsetLeft;
      offsetY = e.clientY - box.offsetTop;
    };

    document.onmousemove = (e) => {
      if (isDragging) {
        box.style.left = e.clientX - offsetX + "px";
        box.style.top = e.clientY - offsetY + "px";
      }
      if (isResizing) {
        box.style.width = e.clientX - box.offsetLeft + "px";
        box.style.height = e.clientY - box.offsetTop + "px";
      }
    };

    document.onmouseup = () => {
      isDragging = false;
      isResizing = false;
    };

    resizeHandle.onmousedown = (e) => {
      e.stopPropagation();
      isResizing = true;
    };
  }

  initInnerDrag();
});


/* ---------------------------
   INNER BOX FUNCTIONS
---------------------------- */

function initInnerDrag() {
  const grid = document.getElementById("innerGrid");
  if (!grid) return;

  grid.querySelectorAll(".inner-box").forEach(box => {
    box.addEventListener("dragstart", () => box.classList.add("dragging"));
    box.addEventListener("dragend", () => box.classList.remove("dragging"));
  });

  grid.ondragover = (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".inner-box.dragging");
    const after = [...grid.querySelectorAll(".inner-box:not(.dragging)")].find(el => {
      const rect = el.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });
    if (after) grid.insertBefore(dragging, after);
    else grid.appendChild(dragging);
  };
}

function addInnerBox() {
  const grid = document.getElementById("innerGrid");
  if (!grid) return;

  const div = document.createElement("div");
  div.className = "inner-box";
  div.draggable = true;
  div.innerHTML = `
    <div class="inner-header">
      <div class="inner-title" contenteditable="true">✨ Uusi otsikko</div>
      <div class="color-picker">
        <input type="color" value="#ffffff" onchange="changeInnerBg(this)">
        <input class="icon-input" maxlength="2" placeholder="🌿" oninput="addIcon(this)">
        <button class="delete-btn" onclick="deleteInnerBox(this)">Poista</button>
      </div>
    </div>
    <div class="inner-text" contenteditable="true">Kirjoita teksti tähän...</div>
  `;
  grid.appendChild(div);
  initInnerDrag();
}

function deleteInnerBox(btn) {
  btn.closest(".inner-box").remove();
}

function changeInnerBg(input) {
  input.closest(".inner-box").style.background = input.value;
}

function addIcon(input) {
  const title = input.closest(".inner-box").querySelector(".inner-title");
  const icon = input.value.trim();
  if (icon) {
    const text = title.textContent.replace(/^\S+\s/, "");
    title.textContent = icon + " " + text;
  }
}


/* ---------------------------
   SAVE & RESET
---------------------------- */

function saveAll() {
  const html = document.body.innerHTML;
  localStorage.setItem("builderSave", html);
  alert("Tallennettu!");
}

function resetAll() {
  localStorage.removeItem("builderSave");
  location.reload();
}


/* ---------------------------
   FLOATING BOXES
---------------------------- */

let floatCount = 0;

function addFloatingBox() {
  floatCount++;
  const box = document.createElement("div");
  box.className = "float-box";
  box.style.top = (80 + floatCount * 40) + "px";
  box.style.left = (80 + floatCount * 40) + "px";
  box.setAttribute("data-id", floatCount);

  box.innerHTML = `
    <div class="float-controls">
      <input type="color" value="#ffffff" onchange="floatChangeColor(this)">
      <input class="float-icon-input" maxlength="2" placeholder="✨" oninput="floatAddIcon(this)">
      <button class="float-delete" onclick="floatDelete(this)">Poista</button>
    </div>
    <div class="float-text" contenteditable="true">🌸 Kelluva laatikko</div>
    <div class="float-resize" onmousedown="floatResizeStart(event, this)"></div>
  `;

  document.getElementById("floatingArea").appendChild(box);
  floatDragInit(box);
}

function floatDragInit(el) {
  el.onmousedown = function(e) {
    if (e.target.classList.contains("float-resize")) return;

    let shiftX = e.clientX - el.getBoundingClientRect().left;
    let shiftY = e.clientY - el.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      el.style.left = pageX - shiftX + 'px';
      el.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    el.onmouseup = function() {
      document.removeEventListener('mousemove', onMouseMove);
      el.onmouseup = null;
    };
  };
}

function floatResizeStart(e, handle) {
  e.stopPropagation();
  const box = handle.closest(".float-box");

  function onMouseMove(e) {
    box.style.width = e.clientX - box.offsetLeft + "px";
    box.style.height = e.clientY - box.offsetTop + "px";
  }

  document.addEventListener("mousemove", onMouseMove);

  document.onmouseup = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.onmouseup = null;
  };
}

function floatChangeColor(input) {
  input.closest(".float-box").style.background = input.value;
}

function floatAddIcon(input) {
  const box = input.closest(".float-box");
  const text = box.querySelector(".float-text");
  const icon = input.value.trim();
  if (icon) {
    text.textContent = icon + " " + text.textContent.replace(/^\S+\s/, "");
  }
}

function floatDelete(btn) {
  btn.closest(".float-box").remove();
}
