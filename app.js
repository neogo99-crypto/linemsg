/**
 * LINE Flex Message Editor State & Render Engine
 */

// 1. App State Definition (Fixed Button Property Schema)
const state = {
    bubble: {
        type: "bubble",
        direction: "ltr",
        styles: {
            body: {
                backgroundColor: "#FFFFFF"
            }
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                { id: "1", type: "text", text: "Welcome to LINE Flex", weight: "bold", size: "xl", color: "#111111" },
                { id: "2", type: "text", text: "This is a real-time production simulator built using vanilla JavaScript.", wrap: true, color: "#666666", size: "sm" },
                { id: "3", type: "button", label: "Action Button", color: "#06C755", action: { type: "uri", label: "action", uri: "https://line.me" } }
            ]
        }
    },
    selectedNodeId: "1"
};

// 2. DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initApp();
});

function initApp() {
    renderPreview();
    renderTree();
    renderPropertiesEditor();
    setupGlobalEventListeners();
}

// 3. Render Engine: State Tree JSON -> Simulated HTML DOM Elements
function renderPreview() {
    const root = document.getElementById("flexMessageRoot");
    root.innerHTML = "";

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "line-bubble";
    bubbleEl.style.direction = state.bubble.direction;
    bubbleEl.style.backgroundColor = state.bubble.styles.body.backgroundColor;

    // Body container layout translation
    const bodyBoxEl = document.createElement("div");
    bodyBoxEl.className = `line-box ${state.bubble.body.layout}`;
    bodyBoxEl.style.padding = "20px";
    bodyBoxEl.style.gap = "10px";

    state.bubble.body.contents.forEach(node => {
        const itemEl = createSimulatedComponent(node);
        if (itemEl) bodyBoxEl.appendChild(itemEl);
    });

    bubbleEl.appendChild(bodyBoxEl);
    root.appendChild(bubbleEl);
}

function createSimulatedComponent(node) {
    switch (node.type) {
        case "text":
            const txt = document.createElement("div");
            txt.innerText = node.text || "Text Element";
            txt.style.color = node.color || "#000000";
            txt.style.fontWeight = node.weight === "bold" ? "700" : "400";
            txt.style.fontSize = node.size === "xl" ? "20px" : node.size === "sm" ? "13px" : "16px";
            txt.style.whiteSpace = node.wrap ? "normal" : "nowrap";
            return txt;
        case "button":
            const btn = document.createElement("div");
            btn.innerText = node.label || "Button";
            btn.style.backgroundColor = node.color || "#06c755";
            btn.style.color = "#FFFFFF";
            btn.style.padding = "10px";
            btn.style.borderRadius = "8px";
            btn.style.textAlign = "center";
            btn.style.fontSize = "14px";
            btn.style.fontWeight = "600";
            btn.style.cursor = "pointer";
            return btn;
        case "image":
            const img = document.createElement("div");
            img.style.width = "100%";
            img.style.height = "150px";
            img.style.backgroundColor = "#e4e4e7";
            img.style.display = "flex";
            img.style.alignItems = "center";
            img.style.justifyContent = "center";
            img.style.borderRadius = "6px";
            img.style.color = "#71717a";
            img.style.fontSize = "12px";
            img.innerText = "Placeholder Image Component";
            return img;
        default:
            return null;
    }
}

// 4. Tree Layout Hierarchy Management
function renderTree() {
    const container = document.getElementById("componentTreeContainer");
    container.innerHTML = "";

    state.bubble.body.contents.forEach(node => {
        const div = document.createElement("div");
        div.className = `tree-node ${node.id === state.selectedNodeId ? 'active' : ''}`;
        div.onclick = () => {
            state.selectedNodeId = node.id;
            renderTree();
            renderPropertiesEditor();
        };

        const leftSide = document.createElement("div");
        leftSide.className = "node-info";
        let iconName = node.type === "text" ? "type" : node.type === "button" ? "square-play" : "image";
        leftSide.innerHTML = `<i data-lucide="${iconName}" class="icon-sm"></i> <span>${node.type.toUpperCase()}</span>`;

        const btnDelete = document.createElement("button");
        btnDelete.className = "btn btn-danger btn-sm";
        btnDelete.innerHTML = `<i data-lucide="trash-2" class="icon-sm"></i>`;
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            deleteNode(node.id);
        };

        div.appendChild(leftSide);
        div.appendChild(btnDelete);
        container.appendChild(div);
    });
    lucide.createIcons();
}

// 5. Dynamic Property Forms Generation & Two-Way Sync
function renderPropertiesEditor() {
    const container = document.getElementById("propertiesEditor");
    container.innerHTML = "";

    const activeNode = state.bubble.body.contents.find(n => n.id === state.selectedNodeId);
    if (!activeNode) {
        container.innerHTML = "<p style='color: var(--text-muted); font-size: 13px;'>Select an element to edit properties.</p>";
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "form-grid";
    wrapper.style.marginTop = "16px";

    // Text Component Logic
    if (activeNode.text !== undefined) {
        wrapper.appendChild(createField("Label Text", "text", activeNode.text, (val) => {
            activeNode.text = val;
            renderPreview();
        }));
    }

    // Button Component Logic (Fixed standard attribute mapping)
    if (activeNode.label !== undefined) {
        wrapper.appendChild(createField("Button Label", "text", activeNode.label, (val) => {
            activeNode.label = val;
            if(activeNode.action) activeNode.action.label = val;
            renderPreview();
        }));
    }

    // Common Color Input Component
    if (activeNode.color !== undefined) {
        wrapper.appendChild(createColorPickerField("Component Color", activeNode.color, (val) => {
            activeNode.color = val;
            renderPreview();
        }));
    }

    // Size Property configurations
    if (activeNode.size !== undefined) {
        const selectGroup = createSelectField("Font Size", ["sm", "md", "xl"], activeNode.size, (val) => {
            activeNode.size = val;
            renderPreview();
        });
        wrapper.appendChild(selectGroup);
    }

    container.appendChild(wrapper);
}

// Form Field Generation Helpers
function createField(labelText, type, currentValue, updateCallback) {
    const group = document.createElement("div");
    group.className = "form-group";
    group.innerHTML = `<label>${labelText}</label><input type="${type}" value="${currentValue}">`;
    group.querySelector("input").addEventListener("input", (e) => updateCallback(e.target.value));
    return group;
}

function createSelectField(labelText, options, currentValue, updateCallback) {
    const group = document.createElement("div");
    group.className = "form-group";
    let optionsHtml = options.map(o => `<option value="${o}" ${o === currentValue ? 'selected' : ''}>${o.toUpperCase()}</option>`).join('');
    group.innerHTML = `<label>${labelText}</label><select>${optionsHtml}</select>`;
    group.querySelector("select").addEventListener("change", (e) => updateCallback(e.target.value));
    return group;
}

function createColorPickerField(labelText, currentHex, updateCallback) {
    const group = document.createElement("div");
    group.className = "form-group";
    group.innerHTML = `
        <label>${labelText}</label>
        <div class="color-picker-group">
            <input type="text" class="hex-input" value="${currentHex}">
            <input type="color" class="picker-input" value="${currentHex}">
        </div>
    `;

    const hexInput = group.querySelector(".hex-input");
    const pickerInput = group.querySelector(".picker-input");

    const syncColor = (value) => {
        let cleanedValue = value.toUpperCase();
        if(cleanedValue.substring(0,1) !== '#') cleanedValue = '#' + cleanedValue;
        hexInput.value = cleanedValue;
        pickerInput.value = cleanedValue;
        updateCallback(cleanedValue);
    };

    hexInput.addEventListener("input", (e) => syncColor(e.target.value));
    pickerInput.addEventListener("input", (e) => syncColor(e.target.value));

    return group;
}

// 6. Action Utility Management Functions
function setupGlobalEventListeners() {
    // Bubble UI Config Bindings
    document.getElementById("bubbleDirection").addEventListener("change", (e) => {
        state.bubble.direction = e.target.value;
        renderPreview();
    });

    const bBgTxt = document.getElementById("bubbleBgColor");
    const bBgPck = document.getElementById("bubbleBgColorPicker");
    const syncBubbleBg = (val) => {
        let upVal = val.toUpperCase();
        bBgTxt.value = upVal;
        bBgPck.value = upVal;
        state.bubble.styles.body.backgroundColor = upVal;
        renderPreview();
    };
    bBgTxt.addEventListener("input", (e) => syncBubbleBg(e.target.value));
    bBgPck.addEventListener("input", (e) => syncBubbleBg(e.target.value));

    // Mobile viewport framing toggles
    document.getElementById("btnToggleFrame").addEventListener("click", () => {
        document.getElementById("simulatorContainer").classList.toggle("raw-width");
    });

    // Add Components Operations
    document.getElementById("btnAddText").addEventListener("click", () => addNode("text"));
    document.getElementById("btnAddButton").addEventListener("click", () => addNode("button"));
    document.getElementById("btnAddImage").addEventListener("click", () => addNode("image"));

    // Exporter Payload Modal Pipeline
    const modal = document.getElementById("jsonModal");
    document.getElementById("btnExportJson").addEventListener("click", () => {
        const cleanPayload = JSON.parse(JSON.stringify(state.bubble));
        cleanPayload.body.contents.forEach(n => delete n.id); // Clear runtime frontend id property
        
        document.getElementById("jsonPreOutput").innerText = JSON.stringify(cleanPayload, null, 2);
        modal.classList.add("open");
    });

    document.getElementById("btnCloseModal").addEventListener("click", () => modal.classList.remove("open"));

    document.getElementById("btnCopyClipboard").addEventListener("click", () => {
        const codeText = document.getElementById("jsonPreOutput").innerText;
        navigator.clipboard.writeText(codeText).then(() => {
            const btn = document.getElementById("btnCopyClipboard");
            const structuralBackup = btn.innerHTML;
            btn.innerText = "Copied!";
            setTimeout(() => { btn.innerHTML = structuralBackup; }, 2000);
        });
    });
}

function addNode(type) {
    const id = Date.now().toString();
    let newNode = { id, type };
    if (type === "text") {
        newNode.text = "New Text Line Item";
        newNode.color = "#333333";
        newNode.size = "md";
    } else if (type === "button") {
        newNode.label = "Click Event";
        newNode.color = "#06C755";
        newNode.action = { type: "uri", label: "action", uri: "https://line.me" };
    }
    state.bubble.body.contents.push(newNode);
    state.selectedNodeId = id;
    renderPreview();
    renderTree();
    renderPropertiesEditor();
}

function deleteNode(id) {
    state.bubble.body.contents = state.bubble.body.contents.filter(n => n.id !== id);
    if (state.selectedNodeId === id) {
        const remaining = state.bubble.body.contents;
        state.selectedNodeId = remaining.length > 0 ? remaining[0].id : null;
    }
    renderPreview();
    renderTree();
    renderPropertiesEditor();
}
