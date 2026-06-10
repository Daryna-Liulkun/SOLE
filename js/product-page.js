/**
 * js/product-page.js
 * Product configurator runtime for SOLE.
 * Responsibilities:
 * - Three.js scene setup and rendering
 * - Config state management (`config`)
 * - DOM bindings for sidebar and dynamic function panel
 * - Update pipeline: `updateWardrobe()` + `renderFunctionPanel()`
 * Keep DOM IDs and data-* attributes consistent when modifying markup.
 */

let scene, camera, renderer, labelRenderer, controls, raycaster;
let mouse = new THREE.Vector2();
let wardrobeGroup, doorsGroup, shelvesGroup, humanScale, utilitiesGroup;
let dimensionLabels = [];
let doorsOpen = true; 

// Configuration State
const config = {
    selectedColumnIndex: -1, 
    columnsData: [
        { width: 0.8, height: 2.1, depth: 0.55, layout: 'hanging', doorType: 'doors', doorDirection: 'double', cableOpenings: [], enclosure: 'closed' },
        { width: 0.8, height: 2.1, depth: 0.55, layout: 'shelves', doorType: 'doors', doorDirection: 'double', cableOpenings: [], enclosure: 'closed' }
    ],
    boardThickness: 0.02,
    materialType: 'painted', 
    materialValue: 'graphite', 
    materialColor: '#333333',
    showDimensions: false,
    moduleH: 0.28, // 28cm module height for breakpoints
    cableMode: 'none' // 'add' | 'remove' | 'none'
};

const materialColors = {
    graphite: '#333333',
    white: '#FFFFFF',
    navy: '#1B263B',
    oak: '#C19A6B',
    walnut: '#67413E',
    pine: '#D7B484'
};

function init() {
    try {
        console.log("Initializing Modular SOLE Configurator...");
        const mount = document.getElementById('threejs-mount');
        const parent = document.getElementById('viewer-card');
        if (!mount || !parent) return;

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfff1e2); 

        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(4, 2.5, 6);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(renderer.domElement);

        labelRenderer = new THREE.CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none';
        mount.appendChild(labelRenderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false; 
        controls.target.set(0, 1.0, 0.5); // Lowered target to center better

        raycaster = new THREE.Raycaster();

        // Premium Lighting Setup
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xfff1e2, 0.6);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(5, 10, 7.5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.left = -5;
        keyLight.shadow.camera.right = 5;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 20;
        keyLight.shadow.bias = -0.0005; 
        keyLight.shadow.radius = 4;
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0xffffff, 0.4);
        fillLight.position.set(-5, 5, 5);
        scene.add(fillLight);

        // Ground Plane
        const groundGeom = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
        const ground = new THREE.Mesh(groundGeom, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);

        wardrobeGroup = new THREE.Group();
        doorsGroup = new THREE.Group();
        shelvesGroup = new THREE.Group();
        utilitiesGroup = new THREE.Group();
        scene.add(wardrobeGroup);
        wardrobeGroup.add(doorsGroup);
        wardrobeGroup.add(shelvesGroup);
        wardrobeGroup.add(utilitiesGroup);

        camera.position.set(4, 1.8, 6); // Lowered camera for better centering

        createHumanReference();
        updateWardrobe();
        setupViewportMenu();
        setupSidebarControls();
        renderFunctionPanel(); // Always render on load
        initAccordions();
        setupRaycasting();

        animate();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

function setupRaycasting() {
    const mount = document.getElementById('threejs-mount');
    if (!mount) return;

    mount.addEventListener('click', (event) => {
        const rect = mount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(wardrobeGroup.children, true);
        
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            // Handle utility button clicks
            if (obj.userData.type === 'cable-btn') {
                const { colIdx, shelfIdx } = obj.userData;
                const col = config.columnsData[colIdx];
                if (config.cableMode === 'add') {
                    if (!col.cableOpenings.includes(shelfIdx)) col.cableOpenings.push(shelfIdx);
                } else if (config.cableMode === 'remove') {
                    col.cableOpenings = col.cableOpenings.filter(i => i !== shelfIdx);
                }
                updateWardrobe();
                return;
            }

            while (obj.parent && obj.userData.columnIndex === undefined) obj = obj.parent;
            if (obj.userData.columnIndex !== undefined) {
                config.selectedColumnIndex = obj.userData.columnIndex;
                renderFunctionPanel();
                updateWardrobe();
                
                // Scroll function panel into view if needed
                const root = document.getElementById('function-panel-root');
                if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}

function renderFunctionPanel() {
    const root = document.getElementById('function-panel-root');
    if (!root) return;

    // Default to first column if none selected
    if (config.selectedColumnIndex === -1) config.selectedColumnIndex = 0;

    const activeCol = config.columnsData[config.selectedColumnIndex];
    root.innerHTML = `
        <h2 class="functionality-title">Functionality</h2>
        
        <div class="func-col-selector" id="funcColSelector">
            <div class="func-col-indicator" id="funcColIndicator"></div>
            ${config.columnsData.map((_, i) => `
                <button data-index="${i}" class="func-col-btn ${config.selectedColumnIndex === i ? 'active' : ''}">${i + 1}</button>
            `).join('')}
        </div>

        <div class="flex flex-col">
            <!-- Selected Section Width -->
            <div class="slider-container">
                <div class="slider-label-row">
                    <span class="slider-name">Width</span>
                    <span id="col-width-val" class="slider-value">${Math.round(activeCol.width * 100)}cm</span>
                </div>
                <input type="range" id="col-width-slider" min="40" max="120" value="${Math.round(activeCol.width * 100)}" class="custom-range">
            </div>

            <!-- Selected Section Height (with breakpoints) -->
            <div class="slider-container">
                <div class="slider-label-row">
                    <span class="slider-name">Height</span>
                    <span id="col-height-val" class="slider-value">${Math.round(activeCol.height * 100)}cm</span>
                </div>
                <div class="slider-wrapper">
                    <div class="slider-track"></div>
                    <div class="slider-markers">
                        ${Array.from({length: 9}).map((_, i) => `<div class="slider-marker"></div>`).join('')}
                    </div>
                    <input type="range" id="col-height-slider" min="50" max="300" step="31.25" value="${Math.round(activeCol.height * 100)}" class="custom-range">
                </div>
            </div>

            <!-- Selected Section Depth -->
            <div class="depth-selector-container">
                <label class="depth-label">Depth</label>
                <div class="depth-selector" id="funcDepthSelector">
                    <div class="depth-indicator" id="funcDepthIndicator"></div>
                    <button class="depth-btn ${Math.round(activeCol.depth * 100) === 25 ? 'active' : ''}" data-value="25" data-index="0">25cm</button>
                    <button class="depth-btn ${Math.round(activeCol.depth * 100) === 35 ? 'active' : ''}" data-value="35" data-index="1">35cm</button>
                    <button class="depth-btn ${Math.round(activeCol.depth * 100) === 45 ? 'active' : ''}" data-value="45" data-index="2">45cm</button>
                    <button class="depth-btn ${Math.round(activeCol.depth * 100) === 55 ? 'active' : ''}" data-value="55" data-index="3">55cm</button>
                </div>
            </div>

            <!-- 1. Configuration interior -->
            <section class="space-y-2" style="margin-bottom: 24px;">
                <label class="interior-label">Configuration interior</label>
                <div class="interior-setup-container" id="interiorSelector">
                    <div class="interior-indicator" id="interiorIndicator"></div>
                    ${[
                        {id: 'shelves', img: 'Shelves.png'},
                        {id: 'shelves_drawers', img: 'Shelves and drawers.png'},
                        {id: 'shelves_drawers_middle', img: 'Shelves and drawers in the middle.png'},
                        {id: 'hanging', img: 'Hanging.png'},
                        {id: 'hanging_drawers', img: 'Hanging and drawers.png'}
                    ].map((p, i) => `
                        <button data-layout="${p.id}" data-index="${i}" class="interior-btn ${activeCol.layout === p.id ? 'active' : ''}" style="background-image: url('assets/${p.img}');"></button>
                    `).join('')}
                </div>
            </section>

            <!-- 2. Enclosure -->
            <section class="space-y-2" style="margin-bottom: 24px;">
                <label class="block text-sm font-normal text-dark">Enclosure</label>
                <div class="enclosure-selector" id="enclosureSelector">
                    <div class="enclosure-indicator" id="enclosureIndicator"></div>
                    <button data-value="open" class="enclosure-btn ${activeCol.enclosure === 'open' ? 'active' : ''}">Open</button>
                    <button data-value="closed" class="enclosure-btn ${activeCol.enclosure === 'closed' ? 'active' : ''}">Closed</button>
                </div>
            </section>

            <!-- 3. Cable Openings -->
            <section class="space-y-2" style="margin-bottom: 24px;">
                <label class="block text-sm font-normal text-dark">Cable Ports</label>
                <div class="enclosure-selector" id="cableSelector">
                    <div class="enclosure-indicator" id="cableIndicator"></div>
                    <button data-mode="none" class="enclosure-btn ${config.cableMode === 'none' ? 'active' : ''}">None</button>
                    <button data-mode="add" class="enclosure-btn ${config.cableMode === 'add' ? 'active' : ''}">Add</button>
                </div>
            </section>
        </div>
    `;

    // Bindings
    root.querySelectorAll('.func-col-btn').forEach(btn => {
        btn.onclick = () => { 
            config.selectedColumnIndex = parseInt(btn.getAttribute('data-index')); 
            renderFunctionPanel(); 
            updateWardrobe(); 
        };
    });

    const updateInteriorIndicator = () => {
        const activeBtn = root.querySelector('.interior-btn.active');
        const indicator = document.getElementById('interiorIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 1 - 4;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };

    root.querySelectorAll('.interior-btn').forEach(btn => {
        btn.onclick = () => {
            const layout = btn.getAttribute('data-layout');
            config.columnsData[config.selectedColumnIndex].layout = layout;
            
            // UI Update without re-render for smooth animation
            root.querySelectorAll('.interior-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateInteriorIndicator();
            
            updateWardrobe();
        };
    });

    updateInteriorIndicator();

    const updateFuncDepthIndicator = () => {
        const activeBtn = root.querySelector('#funcDepthSelector .depth-btn.active');
        const indicator = document.getElementById('funcDepthIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };

    root.querySelectorAll('#funcDepthSelector .depth-btn').forEach(btn => {
        btn.onclick = () => {
            const val = parseInt(btn.getAttribute('data-value')) / 100;
            config.columnsData[config.selectedColumnIndex].depth = val;
            
            // UI Update without re-render for smooth animation
            root.querySelectorAll('#funcDepthSelector .depth-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateFuncDepthIndicator();
            
            updateWardrobe();
        };
    });

    updateFuncDepthIndicator();

    const updateFuncColIndicator = () => {
        const activeBtn = root.querySelector('.func-col-btn.active');
        const indicator = document.getElementById('funcColIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };
    updateFuncColIndicator();

    const updateEnclosureIndicator = () => {
        const activeBtn = root.querySelector('.enclosure-btn.active');
        const indicator = document.getElementById('enclosureIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };

    root.querySelectorAll('.enclosure-btn').forEach(btn => {
        btn.onclick = () => {
            activeCol.enclosure = btn.getAttribute('data-value');
            root.querySelectorAll('.enclosure-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateEnclosureIndicator();
            
            updateWardrobe();
        };
    });
    
    // Explicitly update indicator position after render
    setTimeout(updateEnclosureIndicator, 0);

    const bindSlider = (id, key, valId) => {
        const slider = root.querySelector(`#${id}`);
        if (slider) {
            slider.oninput = (e) => {
                const val = parseInt(e.target.value);
                activeCol[key] = val / 100;
                root.querySelector(`#${valId}`).innerText = `${val}cm`;
                updateWardrobe();
            };
        }
    };
    bindSlider('col-width-slider', 'width', 'col-width-val');
    bindSlider('col-height-slider', 'height', 'col-height-val');

    const updateDoorTypeIndicator = () => {
        const activeBtn = root.querySelector('.door-selector:first-of-type .door-btn.active');
        const indicator = document.getElementById('doorTypeIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };
    updateDoorTypeIndicator();

    const updateDoorDirIndicator = () => {
        const activeBtn = root.querySelector('.door-selector:nth-of-type(2) .door-btn.active');
        const indicator = document.getElementById('doorDirIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };
    updateDoorDirIndicator();

    const updateCableIndicator = () => {
        const activeBtn = root.querySelector('#cableSelector .enclosure-btn.active');
        const indicator = document.getElementById('cableIndicator');
        if (activeBtn && indicator) {
            const x = activeBtn.offsetLeft - 5;
            indicator.style.transform = `translateX(${x}px)`;
        }
    };

    root.querySelectorAll('.door-btn[data-type]').forEach(btn => {
        btn.onclick = () => { 
            activeCol.doorType = btn.getAttribute('data-type');
            root.querySelectorAll('.door-btn[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDoorTypeIndicator();
            
            // Fix: Just update the direction selector visibility instead of full re-render
            const dirSelector = btn.closest('.space-y-2').querySelector('.door-selector:nth-of-type(2)');
            if (activeCol.doorType === 'doors') {
                dirSelector.classList.remove('opacity-20', 'pointer-events-none');
            } else {
                dirSelector.classList.add('opacity-20', 'pointer-events-none');
            }
            updateWardrobe(); 
        };
    });

    root.querySelectorAll('.door-btn[data-dir]').forEach(btn => {
        btn.onclick = () => { 
            activeCol.doorDirection = btn.getAttribute('data-dir'); 
            root.querySelectorAll('.door-btn[data-dir]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDoorDirIndicator();
            
            updateWardrobe(); 
        };
    });

    root.querySelectorAll('#cableSelector .enclosure-btn').forEach(btn => {
        btn.onclick = () => { 
            config.cableMode = btn.getAttribute('data-mode'); 
            root.querySelectorAll('#cableSelector .enclosure-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCableIndicator();
            
            updateWardrobe(); 
        };
    });
    
    // Initial indicator position
    setTimeout(updateCableIndicator, 0);

    // Accessibility: add keyboard support and ARIA roles to function panel buttons
    root.querySelectorAll('button').forEach(btn => {
        if (!btn.hasAttribute('role')) btn.setAttribute('role', 'button');
        if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

function updateSpecificationRow() {
    const totalWidth = config.columnsData.reduce((acc, col) => acc + col.width, 0) + (config.columnsData.length + 1) * config.boardThickness;
    const maxHeight = Math.max(...config.columnsData.map(c => c.height));
    const maxDepth = Math.max(...config.columnsData.map(c => c.depth));

    // Advanced Counts
    let doorCount = 0;
    let drawerCount = 0;
    let cableCount = 0;

    config.columnsData.forEach(col => {
        if (col.doorType === 'doors') {
            doorCount += (col.doorDirection === 'double' || col.width > 0.6) ? 2 : 1;
        }
        if (col.layout.includes('drawers')) drawerCount += 3;
        cableCount += col.cableOpenings.length;
    });

    const sW = document.getElementById('spec-width'), sH = document.getElementById('spec-height'), sD = document.getElementById('spec-depth'), sC = document.getElementById('spec-columns'), sS = document.getElementById('spec-shelving');
    const sColor = document.getElementById('spec-color-name'), sRAL = document.getElementById('spec-ral'), sDoors = document.getElementById('spec-doors-count'), sDrawers = document.getElementById('spec-drawers-count'), sCable = document.getElementById('spec-cable-count');

    if (sW) sW.textContent = Math.round(totalWidth * 100);
    if (sH) sH.textContent = Math.round(maxHeight * 100);
    if (sD) sD.textContent = Math.round(maxDepth * 100);
    if (sC) sC.textContent = config.columnsData.length;

    if (sColor) sColor.textContent = config.materialValue;
    if (sRAL) {
        const ralMap = { graphite: '7024', white: '9016', navy: '5003', oak: '8001', walnut: '8019', pine: '1014' };
        sRAL.textContent = ralMap[config.materialValue] || '----';
    }

    if (sDoors) sDoors.textContent = `x ${doorCount}`;
    if (sDrawers) sDrawers.textContent = `x ${drawerCount}`;
    if (sCable) sCable.textContent = `x ${cableCount}`;

    // Sync Sidebar Sliders
    const sidebarWidthVal = document.getElementById('width-val');
    const sidebarWidthSlider = document.getElementById('width-slider');
    if (sidebarWidthVal && sidebarWidthSlider) {
        sidebarWidthVal.innerText = `${Math.round(totalWidth * 100)}cm`;
        sidebarWidthSlider.value = Math.round(totalWidth * 100);
    }

    const sidebarHeightVal = document.getElementById('height-val');
    const sidebarHeightSlider = document.getElementById('height-slider');
    if (sidebarHeightVal && sidebarHeightSlider) {
        sidebarHeightVal.innerText = `${Math.round(maxHeight * 100)}cm`;
        sidebarHeightSlider.value = Math.round(maxHeight * 100);
    }

    const colVal = document.getElementById('col-val');
    if (colVal) colVal.innerText = config.columnsData.length;

    // Sync Depth
    const depthBtns = document.querySelectorAll('#depthSelector .depth-btn');
    const roundedMaxDepth = Math.round(maxDepth * 100);
    depthBtns.forEach(btn => {
        if (parseInt(btn.getAttribute('data-value')) === roundedMaxDepth) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    updateDepthIndicator();

    if (sS && config.selectedColumnIndex !== -1) {
        const ac = config.columnsData[config.selectedColumnIndex];
        sS.innerHTML = `
            <div class="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
                <div><span class="block text-[10px] font-bold text-white/50 uppercase">Section ${config.selectedColumnIndex + 1}</span><p class="text-sm font-medium text-white">Shelf Width: ${Math.round(ac.width * 100)}cm</p></div>
                <div class="text-right"><span class="block text-[10px] font-bold text-white/50 uppercase">Internal Depth</span><p class="text-sm font-medium text-white">${Math.round((ac.depth - 0.02) * 100)}cm</p></div>
            </div>
        `;
    }
}

function updateWardrobe() {
    try {
        updateSpecificationRow();
        while(shelvesGroup.children.length > 0) shelvesGroup.remove(shelvesGroup.children[0]);
        while(doorsGroup.children.length > 0) doorsGroup.remove(doorsGroup.children[0]);
        while(utilitiesGroup.children.length > 0) utilitiesGroup.remove(utilitiesGroup.children[0]);
        
        const toRemove = [];
        wardrobeGroup.children.forEach(c => { if (c !== doorsGroup && c !== shelvesGroup && c !== utilitiesGroup) toRemove.push(c); });
        toRemove.forEach(c => wardrobeGroup.remove(c));

        const { boardThickness, materialColor, selectedColumnIndex, columnsData } = config;
        const material = new THREE.MeshStandardMaterial({ color: materialColor, roughness: 0.7, metalness: 0.1 });
        const plinthH = 0.03; 
        
        const totalW = columnsData.reduce((acc, col) => acc + col.width, 0) + (columnsData.length + 1) * boardThickness;
        let currentX = -totalW / 2;

        columnsData.forEach((col, index) => {
            const colGroup = new THREE.Group();
            colGroup.userData.columnIndex = index;
            wardrobeGroup.add(colGroup);

            const zPos = col.depth / 2;

            // Box
            const sides = [currentX + boardThickness/2, currentX + col.width + boardThickness * 1.5];
            sides.forEach(x => {
                const s = new THREE.Mesh(new THREE.BoxGeometry(boardThickness, col.height, col.depth), material);
                s.position.set(x, col.height/2, zPos);
                s.castShadow = true; s.receiveShadow = true;
                colGroup.add(s);
            });

            const bottom = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness * 2, boardThickness, col.depth), material);
            bottom.position.set(currentX + col.width/2 + boardThickness, plinthH + boardThickness/2, zPos);
            bottom.castShadow = true; bottom.receiveShadow = true;
            colGroup.add(bottom);

            const plinth = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness * 2, plinthH, 0.01), material);
            plinth.position.set(currentX + col.width/2 + boardThickness, plinthH/2, col.depth - 0.01);
            plinth.castShadow = true; plinth.receiveShadow = true;
            colGroup.add(plinth);

            const top = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness * 2, boardThickness, col.depth), material);
            top.position.set(currentX + col.width/2 + boardThickness, col.height - boardThickness/2, zPos);
            top.castShadow = true; top.receiveShadow = true;
            colGroup.add(top);

            // Back
            const back = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness * 2, col.height - plinthH, 0.01), material);
            back.position.set(currentX + col.width/2 + boardThickness, (col.height + plinthH)/2, 0.005);
            back.receiveShadow = true;
            colGroup.add(back);

            // Cable Openings
            col.cableOpenings.forEach(shelfIdx => {
                const sp = 0.4, y = plinthH + boardThickness + (shelfIdx + 1) * sp - 0.05;
                const hole = new THREE.Mesh(new THREE.CircleGeometry(0.03, 32), new THREE.MeshBasicMaterial({ color: 0x111111 }));
                hole.position.set(currentX + col.width/2 + boardThickness, y, 0.01);
                colGroup.add(hole);
            });

            // Interior
            const shelfDepth = col.depth - 0.02, shelfZ = shelfDepth / 2, shelfX = currentX + col.width/2 + boardThickness;
            const shelfPositions = [];
            const sp = 0.4; // Shelf spacing

            const addShelves = (startY, endY) => {
                const base = plinthH + boardThickness;
                const firstK = Math.max(1, Math.ceil((startY - base + 0.05) / sp));
                const maxK = Math.floor((endY - base - 0.1) / sp);
                for (let k = firstK; k <= maxK; k++) {
                    const y = base + k * sp;
                    shelfPositions.push(y);
                    const shelf = new THREE.Mesh(new THREE.BoxGeometry(col.width, boardThickness, shelfDepth), material);
                    shelf.position.set(shelfX, y, shelfZ);
                    shelf.castShadow = true; shelf.receiveShadow = true;
                    shelvesGroup.add(shelf);
                }
            };

            const addDrawers = (startY) => {
                const dH = 0.22;
                for(let i=0; i<3; i++) {
                    const drawerY = startY + i * dH + dH/2;
                    const dg = new THREE.Group(); dg.position.set(shelfX, drawerY, zPos);
                    const db = new THREE.Mesh(new THREE.BoxGeometry(col.width - 0.01, dH - 0.02, col.depth - 0.02), material);
                    db.castShadow = true; db.receiveShadow = true; dg.add(db);
                    const h = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.02), new THREE.MeshStandardMaterial({color: 0x333333}));
                    h.position.set(0, 0, col.depth/2 - 0.01); dg.add(h); shelvesGroup.add(dg);
                }
                const topY = startY + 3 * dH;
                shelfPositions.push(topY);
                const ms = new THREE.Mesh(new THREE.BoxGeometry(col.width, boardThickness, shelfDepth), material);
                ms.position.set(shelfX, topY, shelfZ);
                ms.castShadow = true; ms.receiveShadow = true; shelvesGroup.add(ms);
                return topY;
            };

            const addHanging = (startY, endY) => {
                const topShelfY = endY - 0.4;
                shelfPositions.push(topShelfY);
                const ts = new THREE.Mesh(new THREE.BoxGeometry(col.width, boardThickness, shelfDepth), material);
                ts.position.set(shelfX, topShelfY, shelfZ);
                ts.castShadow = true; ts.receiveShadow = true;
                shelvesGroup.add(ts);
                const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, col.width), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 }));
                rod.rotation.z = Math.PI / 2; rod.position.set(shelfX, endY - 0.45, shelfZ);
                rod.castShadow = true; shelvesGroup.add(rod);
            };

            if (col.layout === 'shelves') {
                addShelves(plinthH + boardThickness, col.height);
            } else if (col.layout === 'hanging') {
                addHanging(plinthH + boardThickness, col.height);
            } else if (col.layout === 'shelves_drawers') {
                const drawersTop = addDrawers(plinthH + boardThickness);
                addShelves(drawersTop, col.height);
            } else if (col.layout === 'hanging_drawers') {
                const drawersTop = addDrawers(plinthH + boardThickness);
                addHanging(drawersTop, col.height);
            } else if (col.layout === 'shelves_drawers_middle') {
                const bottomShelvesEnd = plinthH + boardThickness + 0.8;
                addShelves(plinthH + boardThickness, bottomShelvesEnd);
                const drawersTop = addDrawers(bottomShelvesEnd);
                addShelves(drawersTop, col.height);
            }


            // Cable markers (Interactive in cableMode)
            if (config.cableMode !== 'none' && index === selectedColumnIndex) {
                shelfPositions.forEach((y, sIdx) => {
                    const btnGeom = new THREE.CircleGeometry(0.04, 32);
                    const isAdd = config.cableMode === 'add';
                    const btnMat = new THREE.MeshBasicMaterial({ color: isAdd ? 0x00ff00 : 0xff0000, transparent: true, opacity: 0.8 });
                    const btn = new THREE.Mesh(btnGeom, btnMat);
                    btn.position.set(shelfX, y - 0.05, 0.02);
                    btn.userData = { type: 'cable-btn', colIdx: index, shelfIdx: sIdx };
                    utilitiesGroup.add(btn);
                    // Label (+ / -)
                    const div = document.createElement('div');
                    div.style.color = 'white'; div.style.fontSize = '12px'; div.style.fontWeight = 'bold';
                    div.textContent = isAdd ? '+' : '-';
                    const label = new THREE.CSS2DRenderer(); // Mockup logic, usually CSS2DObject
                });
            }

            // Doors & Hinges
            if (col.enclosure === 'closed' && col.doorType === 'doors') {
                const doorAngle = Math.PI / 1.8, hingeOff = 0.01;
                const dH = col.height - plinthH - boardThickness, dY = plinthH + boardThickness + dH/2;
                
                const createHinges = (pivot, side) => {
                    [dH*0.3, -dH*0.3].forEach(y => {
                        const h = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.05, 0.02), new THREE.MeshStandardMaterial({color: 0x888888}));
                        h.position.set(side === 'left' ? -0.005 : 0.005, y, -0.01);
                        pivot.add(h);
                    });
                };

                if (col.doorDirection === 'double' || col.width > 0.6) {
                    const dW = (col.width + boardThickness) / 2;
                    const pL = new THREE.Group(); pL.position.set(currentX + boardThickness, dY, col.depth);
                    pL.userData.side = 'left'; pL.rotation.y = doorsOpen ? -doorAngle : 0;
                    const dL = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, 0.02), material);
                    dL.position.set(dW/2 - hingeOff, 0, 0.01); 
                    dL.castShadow = true; dL.receiveShadow = true; pL.add(dL); createHinges(pL, 'left'); doorsGroup.add(pL);
                    
                    const pR = new THREE.Group(); pR.position.set(currentX + col.width + boardThickness, dY, col.depth);
                    pR.userData.side = 'right'; pR.rotation.y = doorsOpen ? doorAngle : 0;
                    const dR = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, 0.02), material);
                    dR.position.set(-dW/2 + hingeOff, 0, 0.01);
                    dR.castShadow = true; dR.receiveShadow = true; pR.add(dR); createHinges(pR, 'right'); doorsGroup.add(pR);
                } else {
                    const isL = col.doorDirection === 'left';
                    const p = new THREE.Group();
                    p.position.set(isL ? currentX + boardThickness : currentX + col.width + boardThickness, dY, col.depth);
                    p.userData.side = isL ? 'left' : 'right';
                    p.rotation.y = doorsOpen ? (isL ? -doorAngle : doorAngle) : 0;
                    const d = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness, dH, 0.02), material);
                    d.position.set(isL ? (col.width + boardThickness)/2 - hingeOff : -(col.width + boardThickness)/2 + hingeOff, 0, 0.01);
                    d.castShadow = true; d.receiveShadow = true; p.add(d); createHinges(p, isL ? 'left' : 'right'); doorsGroup.add(p);
                }
            }

            if (index === selectedColumnIndex) {
                const h = new THREE.Mesh(new THREE.BoxGeometry(col.width + boardThickness * 2, col.height, col.depth + 0.02), new THREE.MeshStandardMaterial({ color: 0xB14C24, transparent: true, opacity: 0.1 }));
                h.position.set(currentX + col.width/2 + boardThickness, col.height/2, zPos);
                h.add(new THREE.LineSegments(new THREE.EdgesGeometry(h.geometry), new THREE.LineBasicMaterial({ color: 0xB14C24, linewidth: 2 })));
                colGroup.add(h);
            }
            currentX += col.width + boardThickness;
        });

        if (humanScale) humanScale.position.set(-totalW/2 - 1.0, 0.85, 0.8); 
        updateLabels(totalW);
    } catch (e) { console.error('Update error:', e); }
}

function updateLabels(totalW) {
    dimensionLabels.forEach(l => l.parent && l.parent.remove(l));
    dimensionLabels = [];
    if (config.showDimensions) {
        let currentX = -totalW / 2;
        createLabel(wardrobeGroup, `${Math.round(totalW*100)}cm`, new THREE.Vector3(0, 3.2, 0.6), 'label-width');
        config.columnsData.forEach(col => {
            const x = currentX + col.width/2 + config.boardThickness;
            createLabel(wardrobeGroup, `${Math.round(col.width*100)}cm`, new THREE.Vector3(x, col.height + 0.15, col.depth), 'label-col-width');
            const plinthH = 0.03, bt = config.boardThickness, pos = [];
            if (col.layout === 'stack') {
                const sp = 0.4, num = Math.floor((col.height - plinthH - 0.4) / sp);
                for (let s = 0; s <= num; s++) pos.push(plinthH + bt + s * sp);
                pos.push(col.height - bt);
            } else if (col.layout === 'hang') {
                pos.push(plinthH + bt, col.height - 0.4, col.height - bt);
            } else if (col.layout === 'drawers') {
                pos.push(plinthH + bt, plinthH + bt + 3 * 0.22, col.height - bt);
            }
            for (let i = 1; i < pos.length; i++) {
                const midY = (pos[i] + pos[i-1]) / 2, h = Math.round((pos[i] - pos[i-1]) * 100);
                createLabel(wardrobeGroup, `${h}cm`, new THREE.Vector3(x, midY, col.depth + 0.05), 'label-shelf-height small-label');
            }
            currentX += col.width + config.boardThickness;
        });
    }
}

function createLabel(p, t, pos, c) {
    const d = document.createElement('div'); d.className = `dimension-label ${c}`; 
    d.style.fontSize = '9px'; d.style.padding = '2px 8px';
    d.textContent = t;
    const l = new THREE.CSS2DObject(d); l.position.copy(pos); p.add(l); dimensionLabels.push(l);
}

function setupViewportMenu() {
    const bZIn = document.getElementById('zoom-in'), bZOut = document.getElementById('zoom-out'), bDms = document.getElementById('toggle-dims'), bDrs = document.getElementById('toggle-doors'), bInfo = document.getElementById('scroll-to-spec');
    
    if (bZIn) bZIn.onclick = () => camera.position.multiplyScalar(0.9);
    if (bZOut) bZOut.onclick = () => camera.position.multiplyScalar(1.1);
    
    if (bDms) bDms.onclick = () => { 
        config.showDimensions = !config.showDimensions; 
        updateWardrobe(); 
        bDms.classList.toggle('text-accent', config.showDimensions);
        bDms.classList.toggle('text-dark', !config.showDimensions);
    };

    if (bDrs) bDrs.onclick = () => {
        doorsOpen = !doorsOpen;
        const angle = Math.PI / 1.8;
        doorsGroup.children.forEach(p => {
            const target = doorsOpen ? (p.userData.side === 'left' ? -angle : angle) : 0;
            if (window.gsap) gsap.to(p.rotation, { y: target, duration: 0.8 });
            else p.rotation.y = target;
        });
        bDrs.classList.toggle('text-accent', doorsOpen);
        bDrs.classList.toggle('text-dark', !doorsOpen);
    };

    if (bInfo) {
        bInfo.onclick = () => {
            const specSection = document.getElementById('specification-section');
            if (specSection) specSection.scrollIntoView({ behavior: 'smooth' });
        };
    }
    
    if (bDms) bDms.classList.add(config.showDimensions ? 'text-accent' : 'text-dark');
    if (bDrs) bDrs.classList.add(doorsOpen ? 'text-accent' : 'text-dark');

    document.querySelectorAll('.bg-swatch').forEach(btn => {
        btn.onclick = () => {
            const c = btn.getAttribute('data-color');
            scene.background = new THREE.Color(c);
            document.getElementById('viewer-card').style.backgroundColor = c;
        };
    });
}

function updateDepthIndicator() {
    const activeBtn = document.querySelector('#depthSelector .depth-btn.active');
    const indicator = document.getElementById('depthIndicator');
    if (activeBtn && indicator) {
        const x = activeBtn.offsetLeft - 5;
        indicator.style.transform = `translateX(${x}px)`;
    }
}

function updateMaterialsIndicator() {
    const activeBtn = document.querySelector('#materialsSelector .material-toggle-btn.active');
    const indicator = document.getElementById('materialsIndicator');
    if (activeBtn && indicator) {
        const x = activeBtn.offsetLeft - 5;
        indicator.style.transform = `translateX(${x}px)`;
    }
}

function setupSidebarControls() {
    const wS = document.getElementById('width-slider'), hS = document.getElementById('height-slider');
    if (wS) wS.oninput = (e) => {
        const val = e.target.value / 100, cur = config.columnsData.reduce((a, b) => a + b.width, 0);
        config.columnsData.forEach(c => c.width *= (val / cur));
        updateWardrobe();
        if (config.selectedColumnIndex !== -1) {
            // Sync section width slider if visible
            const colWVal = document.getElementById('col-width-val');
            const colWSlider = document.getElementById('col-width-slider');
            if (colWVal && colWSlider) {
                const activeCol = config.columnsData[config.selectedColumnIndex];
                const w = Math.round(activeCol.width * 100);
                colWVal.innerText = `${w}cm`;
                colWSlider.value = w;
            }
        }
    };
    if (hS) hS.oninput = (e) => {
        const h = e.target.value / 100;
        config.columnsData.forEach(c => c.height = h);
        updateWardrobe();
        if (config.selectedColumnIndex !== -1) {
            // Sync section height slider if visible
            const colHVal = document.getElementById('col-height-val');
            const colHSlider = document.getElementById('col-height-slider');
            if (colHVal && colHSlider) {
                const activeCol = config.columnsData[config.selectedColumnIndex];
                const hv = Math.round(activeCol.height * 100);
                colHVal.innerText = `${hv}cm`;
                colHSlider.value = hv;
            }
        }
    };

    document.querySelectorAll('#depthSelector .depth-btn').forEach(btn => {
        btn.onclick = () => {
            config.columnsData.forEach(c => c.depth = parseInt(btn.getAttribute('data-value')) / 100);
            document.querySelectorAll('#depthSelector .depth-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDepthIndicator();
            updateWardrobe();
            if (config.selectedColumnIndex !== -1) renderFunctionPanel();
        };
    });
    
    // Initial indicator position
    setTimeout(updateDepthIndicator, 100);
    document.getElementById('plus-col').onclick = () => {
        if (config.columnsData.length < 6) { 
            config.columnsData.push({ ...config.columnsData[config.columnsData.length-1] }); 
            updateWardrobe(); 
            renderFunctionPanel(); // Refresh to show new column button
        }
    };
    document.getElementById('minus-col').onclick = () => {
        if (config.columnsData.length > 1) { 
            config.columnsData.pop(); 
            if (config.selectedColumnIndex >= config.columnsData.length) config.selectedColumnIndex = config.columnsData.length - 1; 
            updateWardrobe(); 
            renderFunctionPanel();
        }
    };

    document.querySelectorAll('.material-toggle-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.material-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateMaterialsIndicator();
            
            const t = btn.getAttribute('data-type');
            document.getElementById('painted-options').classList.toggle('hidden', t !== 'painted');
            document.getElementById('wood-options').classList.toggle('hidden', t !== 'wood');
        };
    });
    
    // Initial indicators positions
    setTimeout(() => {
        updateDepthIndicator();
        updateMaterialsIndicator();
    }, 100);

    document.querySelectorAll('.material-opt').forEach(btn => {
        btn.onclick = () => { 
            config.materialValue = btn.getAttribute('data-value'); 
            config.materialColor = materialColors[config.materialValue]; 
            document.querySelectorAll('.material-opt').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-dark'));
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-dark');
            updateWardrobe(); 
        };
    });
}

function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach(btn => {
        btn.onclick = () => {
            const c = btn.nextElementSibling;
            const isOpen = c.style.maxHeight && c.style.maxHeight !== '0px';
            
            document.querySelectorAll('.accordion-content').forEach(el => el.style.maxHeight = null);
            document.querySelectorAll('.accordion-trigger i').forEach(icon => {
                icon.classList.remove('ph-minus');
                icon.classList.add('ph-plus');
            });
            
            if (!isOpen) {
                c.style.maxHeight = c.scrollHeight + 'px';
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('ph-plus');
                    icon.classList.add('ph-minus');
                }
            }
        };
    });
}

function createHumanReference() {
    new THREE.TextureLoader().load('reference/person.png', (tex) => {
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, opacity: 0.7 });
        humanScale = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.7), mat);
        updateWardrobe();
        scene.add(humanScale);
    }, undefined, (err) => {
        console.error("Failed to load silhouette:", err);
    });
}

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); labelRenderer.render(scene, camera); }

window.onload = () => {
    init();
    
    // Wishlist binding
    const wishlistTriggers = document.querySelectorAll('.wishlist-btn, #wishlist-trigger');

    wishlistTriggers.forEach(btn => {
        btn.onclick = (e) => {
            if (btn.id === 'wishlist-trigger') {
                e.preventDefault();
                // Add current configuration to localStorage
                const configItem = {
                    name: "Custom Closet",
                    dims: `${Math.round(config.columnsData.reduce((acc, col) => acc + col.width, 0) * 100)}x${Math.round(Math.max(...config.columnsData.map(c => c.height)) * 100)}cm`,
                    price: document.querySelector('.current-price').textContent,
                    img: 'assets/cabinet.jpg'
                };
                const wishlist = JSON.parse(localStorage.getItem('sole-wishlist') || '[]');
                wishlist.push(configItem);
                localStorage.setItem('sole-wishlist', JSON.stringify(wishlist));
                alert("Added to wishlist!");
            }
            // For other triggers, just let the navigation happen
        };
    });

};
window.onresize = () => { const p = document.getElementById('viewer-card'); camera.aspect = p.clientWidth / p.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(p.clientWidth, p.clientHeight); labelRenderer.setSize(p.clientWidth, p.clientHeight); };
