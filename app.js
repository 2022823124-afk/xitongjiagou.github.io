const STORAGE_KEY = "decision-infinite-canvas-v6";
const stageWidth = 7200;
const stageHeight = 4200;

const viewport = document.querySelector("#viewport");
const stage = document.querySelector("#stage");
const frameLayer = document.querySelector("#frame-layer");
const nodeLayer = document.querySelector("#node-layer");
const edgeLayer = document.querySelector("#edge-layer");

const controls = {
  addNode: document.querySelector("#add-node"),
  addDecision: document.querySelector("#add-decision"),
  addNote: document.querySelector("#add-note"),
  addShot: document.querySelector("#add-shot"),
  imageInput: document.querySelector("#image-input"),
  importJson: document.querySelector("#import-json"),
  title: document.querySelector("#node-title"),
  desc: document.querySelector("#node-desc"),
  kind: document.querySelector("#node-kind"),
  code: document.querySelector("#selected-code"),
  deleteNode: document.querySelector("#delete-node"),
  linkSelected: document.querySelector("#link-selected"),
  connectMode: document.querySelector("#connect-mode"),
  reverseEdge: document.querySelector("#reverse-edge"),
  straightenEdge: document.querySelector("#straighten-edge"),
  deleteEdge: document.querySelector("#delete-edge"),
  edgeStatus: document.querySelector("#edge-status"),
  exportJson: document.querySelector("#export-json"),
  resetBoard: document.querySelector("#reset-board"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomRange: document.querySelector("#zoom-range"),
  fitView: document.querySelector("#fit-view"),
  actualSize: document.querySelector("#actual-size"),
  zoomReadout: document.querySelector("#zoom-readout"),
};

const initialState = {
  selectedId: "start",
  selectedEdgeId: null,
  selectedFrameId: null,
  previousId: null,
  connectFromId: null,
  pendingConnection: null,
  view: { scale: 0.62, x: -420, y: -70 },
  frames: [
    { id: "pool", code: "FRAME 01", title: "需求池", x: 640, y: 620, w: 760, h: 2500 },
    { id: "define", code: "FRAME 02", title: "定义", x: 1460, y: 620, w: 780, h: 2500 },
    { id: "system", code: "FRAME 03", title: "系统架构设计", x: 2300, y: 620, w: 820, h: 2500 },
    { id: "ui", code: "FRAME 04", title: "界面设计", x: 3180, y: 620, w: 860, h: 2500 },
    { id: "reuse", code: "BRANCH", title: "复用反馈 / 回访", x: 4100, y: 540, w: 900, h: 1700 },
  ],
  nodes: [
    { id: "start", code: "START", kind: "white", x: 330, y: 1240, title: "思考是做老手传接安装教程，还是传接 Claw 经验", desc: "先把最原始的问题放在画布左侧，后面所有分支都从这里展开。", meta: "起点" },
    { id: "need-a", code: "N1", kind: "red", x: 780, y: 560, title: "从资料包传接变成团队可复用的知识库", desc: "", meta: "需求池" },
    { id: "need-b", code: "N2", kind: "red", x: 780, y: 800, title: "明确“老手经验”不是泛泛经验，而是竞品评论分析经验", desc: "", meta: "需求池" },
    { id: "need-c", code: "N3", kind: "red", x: 780, y: 1045, title: "提炼出电商团队的经验难复用的问题", desc: "", meta: "需求池" },
    { id: "need-d", code: "N4", kind: "red", x: 780, y: 1285, title: "缺少可复用的经验", desc: "", meta: "需求池" },
    { id: "def-a", code: "D1", kind: "red", x: 1590, y: 585, title: "一次大促完整的分析路径", desc: "", meta: "定义" },
    { id: "def-b", code: "D2", kind: "red", x: 1590, y: 800, title: "把老手经验拆成 Claw 使用方法、分析流程模板、安全边界、常见错误处理", desc: "", meta: "定义" },
    { id: "def-c", code: "D3", kind: "red", x: 1590, y: 1040, title: "把电商经验转化为任务知识库", desc: "", meta: "定义" },
    { id: "def-d", code: "D4", kind: "red", x: 1590, y: 1265, title: "把老手经验转化知识库系统", desc: "", meta: "定义" },
    { id: "sys-a", code: "S1", kind: "red", x: 2470, y: 585, title: "把分析工作流转化可学习、调用、复用的页面", desc: "", meta: "系统架构设计" },
    { id: "sys-b", code: "S2", kind: "red", x: 2470, y: 810, title: "把分析工作流转化可学习、调用、复用的页面", desc: "", meta: "系统架构设计" },
    { id: "sys-c", code: "S3", kind: "red", x: 2470, y: 1045, title: "把后台知识库转化为新人可查询、老手可补充、团队可复用的界面", desc: "", meta: "系统架构设计" },
    { id: "sys-d", code: "S4", kind: "red", x: 2470, y: 1265, title: "新人可查询、老手可录入的操作界面", desc: "", meta: "系统架构设计" },
    { id: "choose-tool", code: "G1", kind: "green", x: 880, y: 1600, title: "选择做“老手交接工具”，而不是普通文档", desc: "", meta: "方案分支" },
    { id: "team-use", code: "G2", kind: "green", x: 1560, y: 1600, title: "让个人会用变成团队能用", desc: "", meta: "方案分支" },
    { id: "query-path", code: "G3", kind: "green", x: 2410, y: 1600, title: "突出老手录入经验和新人按任务查询两个核心路径", desc: "", meta: "系统路径" },
    { id: "scene", code: "G4", kind: "green", x: 3210, y: 1600, title: "细化具体人群和使用场景", desc: "", meta: "界面路径" },
    { id: "people-note", code: "NOTE", kind: "white", x: 1480, y: 1790, title: "从产品经理、电商团队选人群聚焦，由于身边有电商团队的人群可采访", desc: "", meta: "依据" },
    { id: "handoff-scene", code: "G5", kind: "green", x: 805, y: 1980, title: "聚焦电商团队交接场景", desc: "", meta: "方案分支" },
    { id: "workkit", code: "G6", kind: "green", x: 1590, y: 1980, title: "电商团队的可交接 Work Kit，以工作流组织内容", desc: "", meta: "定义" },
    { id: "priority", code: "G7", kind: "green", x: 2410, y: 1980, title: "优先设计任务流程、经验卡片、AI 问答、案例复盘四个核心功能", desc: "", meta: "系统架构" },
    { id: "legacy", code: "Q", kind: "white", x: 3270, y: 1990, title: "老手到底可以传承什么？", desc: "", meta: "追问" },
    { id: "ask-staff", code: "NOTE", kind: "white", x: 1730, y: 2168, title: "询问了电商工作人员", desc: "", meta: "调研依据" },
    { id: "claw-scene", code: "G8", kind: "green", x: 700, y: 2360, title: "聚焦“Claw辅助竞品评论分析”的交接场景", desc: "", meta: "方案分支" },
    { id: "knowledge-org", code: "G9", kind: "green", x: 1590, y: 2360, title: "工作流组织知识包", desc: "", meta: "定义" },
    { id: "module-flow", code: "G10", kind: "green", x: 2410, y: 2360, title: "优化每个板块的操作流程，突出可复用功能", desc: "", meta: "系统架构" },
    { id: "kb-question", code: "Q", kind: "white", x: 3240, y: 2380, title: "应该是知识库不是复用包", desc: "", meta: "追问" },
    { id: "tool-note", code: "NOTE", kind: "white", x: 1665, y: 2540, title: "用了 ChatGPT、Codex、Claude Code、DeepSeek 等进行询问", desc: "", meta: "外部验证" },
    { id: "build-system", code: "G11", kind: "green", x: 760, y: 2740, title: "做电商大促 AI 工作包系统", desc: "", meta: "方案收束" },
    { id: "pipeline", code: "G12", kind: "green", x: 1590, y: 2740, title: "资料筛选-AI分析-人工判读-知识沉淀", desc: "", meta: "定义" },
    { id: "db-design", code: "G13", kind: "green", x: 2410, y: 2740, title: "重点设计资料入库，重点标注、分析模块、结果校验、版本回流", desc: "", meta: "系统架构" },
    { id: "compare-note", code: "NOTE", kind: "white", x: 1290, y: 2920, title: "对比了现有电商智能体", desc: "", meta: "竞品依据" },
    { id: "feedback-note", code: "NOTE", kind: "white", x: 1945, y: 2920, title: "电商设计师反馈使用第一次版本", desc: "", meta: "反馈依据" },
    { id: "unclear", code: "Q", kind: "white", x: 3280, y: 2920, title: "使用流程不明确", desc: "", meta: "问题" },
    { id: "reuse-process", code: "R1", kind: "decision", x: 4050, y: 640, title: "明确多次复用过程", desc: "", meta: "复用反馈" },
    { id: "second-use", code: "R2", kind: "decision", x: 4270, y: 1040, title: "给电商设计师二次使用反馈", desc: "", meta: "复用反馈" },
    { id: "review", code: "R3", kind: "bubble", x: 4240, y: 1510, title: "回访记录", desc: "目前网页功能多，能帮助新人快速启动竞品评论分析，可能后面可以再优化一下交互逻辑。", meta: "回访" },
    { id: "output", code: "OUT", kind: "green", x: 4240, y: 2700, title: "内容丰富，一次大促分析路径明确，实现了资料库功能", desc: "", meta: "最终产出" },
  ],
  edges: [
    edge("start", "need-d", "white"), edge("start", "need-c", "white"), edge("start", "need-b", "white"), edge("start", "need-a", "white"),
    edge("need-d", "choose-tool", "green"), edge("need-d", "handoff-scene", "green"), edge("need-d", "claw-scene", "green"), edge("need-d", "build-system", "green"),
    edge("need-d", "need-c", "white"), edge("need-c", "need-b", "white"), edge("need-b", "need-a", "white"),
    edge("need-a", "def-a", "red"), edge("need-b", "def-b", "red"), edge("need-c", "def-c", "red"), edge("need-d", "def-d", "red"),
    edge("def-d", "def-c", "white"), edge("def-c", "def-b", "white"), edge("def-b", "def-a", "white"),
    edge("def-a", "sys-a", "red"), edge("def-b", "sys-b", "red"), edge("def-c", "sys-c", "red"), edge("def-d", "sys-d", "red"),
    edge("sys-d", "sys-c", "white"), edge("sys-c", "sys-b", "white"), edge("sys-b", "sys-a", "white"),
    edge("choose-tool", "team-use", "green"), edge("team-use", "query-path", "green"), edge("query-path", "scene", "green"), edge("scene", "review", "green"),
    edge("handoff-scene", "workkit", "green"), edge("workkit", "priority", "green"), edge("priority", "legacy", "green"),
    edge("claw-scene", "knowledge-org", "green"), edge("knowledge-org", "module-flow", "green"), edge("module-flow", "kb-question", "green"),
    edge("build-system", "pipeline", "green"), edge("pipeline", "db-design", "green"), edge("db-design", "output", "green"),
    edge("sys-a", "reuse-process", "green"), edge("reuse-process", "second-use", "green"), edge("second-use", "review", "green"), edge("review", "output", "green"),
    edge("people-note", "team-use", "green"), edge("ask-staff", "priority", "green"), edge("tool-note", "module-flow", "green"),
    edge("compare-note", "pipeline", "green"), edge("feedback-note", "db-design", "green"), edge("unclear", "output", "green"),
  ],
};

let state = loadState();
let dragNode = null;
let dragFrame = null;
let resizeFrame = null;
let dragEdge = null;
let pan = null;
let applyingRemoteState = false;
let remoteSaveTimer = null;
let localSaveTimer = null;

function edge(from, to, tone = "green", mid = null, fromAnchor = "right", toAnchor = "left") {
  return { id: `edge-${from}-${to}-${Math.random().toString(16).slice(2)}`, from, to, tone, mid, fromAnchor, toAnchor };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalizeState(clone(initialState));
  try {
    return normalizeState({ ...clone(initialState), ...JSON.parse(saved) });
  } catch {
    return normalizeState(clone(initialState));
  }
}

function normalizeState(nextState) {
  nextState.edges = nextState.edges.map((item, index) => {
    if (Array.isArray(item)) {
      return { id: `edge-${index}-${item[0]}-${item[1]}`, from: item[0], to: item[1], tone: item[2] || "green", mid: null, fromAnchor: "right", toAnchor: "left" };
    }
    return {
      id: item.id || `edge-${index}-${item.from}-${item.to}`,
      from: item.from,
      to: item.to,
      tone: item.tone || "green",
      mid: item.mid || null,
      fromAnchor: item.fromAnchor || "right",
      toAnchor: item.toAnchor || "left",
    };
  });
  nextState.selectedEdgeId = null;
  nextState.connectFromId = null;
  nextState.pendingConnection = null;
  return nextState;
}

function saveState() {
  clearTimeout(localSaveTimer);
  localSaveTimer = setTimeout(persistState, 650);
}

function persistState() {
  const serialized = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serialized);
  if (location.protocol.startsWith("http") && !applyingRemoteState) {
    clearTimeout(remoteSaveTimer);
    remoteSaveTimer = setTimeout(() => pushRemoteState(serialized), 450);
  }
}

function getNode(id) {
  return state.nodes.find((node) => node.id === id);
}

function getFrame(id) {
  return state.frames.find((frame) => frame.id === id);
}

function getEdge(id) {
  return state.edges.find((item) => item.id === id);
}

function render() {
  renderFrames();
  nodeLayer.innerHTML = "";
  state.nodes.forEach((node) => nodeLayer.appendChild(renderNode(node)));
  renderEdges();
  syncInspector();
  applyView();
  saveState();
}

function renderFrames() {
  frameLayer.innerHTML = "";
  state.frames.forEach((frame) => {
    const element = document.createElement("section");
    element.className = `stage-frame${frame.id === state.selectedFrameId ? " selected-frame" : ""}`;
    element.style.left = `${frame.x}px`;
    element.style.top = `${frame.y}px`;
    element.style.width = `${frame.w}px`;
    element.style.height = `${frame.h}px`;
    element.dataset.id = frame.id;
    element.innerHTML = `<div class="frame-title" data-role="title"><span>${escapeHtml(frame.code)}</span>${escapeHtml(frame.title)}</div><div class="resize-handle" data-role="resize" aria-hidden="true"></div>`;
    element.addEventListener("pointerdown", startFrameInteraction);
    frameLayer.appendChild(element);
  });
}

function renderNode(node) {
  const element = document.createElement("article");
  element.className = `flow-node ${node.kind}${node.id === state.selectedId ? " selected" : ""}`;
  element.classList.toggle("connect-target", Boolean(state.connectFromId && state.connectFromId !== node.id));
  element.classList.toggle("connector-source", state.pendingConnection?.from === node.id);
  element.style.left = `${node.x}px`;
  element.style.top = `${node.y}px`;
  element.dataset.id = node.id;
  element.innerHTML = `${renderConnectors()}<span class="code">${escapeHtml(node.code)}</span>${node.kind === "image" ? renderShot(node) : ""}<h3>${escapeHtml(node.title)}</h3><p>${escapeHtml(node.desc)}</p><small>${escapeHtml(node.meta || "")}</small>`;
  element.addEventListener("pointerdown", startNodeDrag);
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.connectFromId && state.connectFromId !== node.id) {
      addEdge(state.connectFromId, node.id, edgeToneFor(state.connectFromId, node.id));
      state.connectFromId = null;
      render();
      return;
    }
    selectNode(node.id);
  });
  element.addEventListener("dblclick", (event) => {
    if (node.kind !== "image") return;
    event.stopPropagation();
    selectNode(node.id);
    controls.imageInput.click();
  });
  element.addEventListener("dragover", (event) => {
    if (!hasImageFile(event.dataTransfer)) return;
    event.preventDefault();
  });
  element.addEventListener("drop", (event) => {
    if (!hasImageFile(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    readImageFile(event.dataTransfer.files[0], node.id);
  });
  element.querySelectorAll(".connector-dot").forEach((dot) => {
    dot.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleConnectorClick(node.id, dot.dataset.anchor);
    });
  });
  return element;
}

function renderConnectors() {
  return ["top", "right", "bottom", "left"].map((anchor) => `<button class="connector-dot ${anchor}" data-anchor="${anchor}" type="button" aria-label="连接点 ${anchor}"></button>`).join("");
}

function renderShot(node) {
  if (node.image) return `<img class="shot-preview" src="${node.image}" alt="${escapeHtml(node.title)}">`;
  return `<div class="shot-empty">双击上传截图</div>`;
}

function renderEdges() {
  edgeLayer.innerHTML = `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,.72)"></path></marker></defs>`;
  state.edges.forEach((item) => {
    const from = getNode(item.from);
    const to = getNode(item.to);
    if (!from || !to) return;
    const points = edgePoints(item, from, to);
    const pathData = `M ${points.start.x} ${points.start.y} Q ${points.mid.x} ${points.mid.y}, ${points.end.x} ${points.end.y}`;
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("class", "edge-hit");
    hit.setAttribute("d", pathData);
    hit.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      selectEdge(item.id);
    });
    edgeLayer.appendChild(hit);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", `edge ${item.tone || ""}${item.id === state.selectedEdgeId ? " selected-edge" : ""}`);
    path.setAttribute("marker-end", "url(#arrow)");
    path.setAttribute("d", pathData);
    edgeLayer.appendChild(path);

    if (item.id === state.selectedEdgeId) {
      const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      handle.setAttribute("class", "edge-handle");
      handle.setAttribute("cx", points.mid.x);
      handle.setAttribute("cy", points.mid.y);
      handle.setAttribute("r", "9");
      handle.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        dragEdge = { id: item.id };
      });
      edgeLayer.appendChild(handle);
    }
  });
}

function edgePoints(item, from, to) {
  const fromBox = measureNode(from);
  const toBox = measureNode(to);
  const start = anchorPoint(fromBox, item.fromAnchor || "right");
  const end = anchorPoint(toBox, item.toAnchor || "left");
  const mid = item.mid || { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  return { start, mid, end };
}

function anchorPoint(box, anchor) {
  const points = {
    top: { x: box.x + box.w / 2, y: box.y },
    right: { x: box.x + box.w, y: box.y + box.h / 2 },
    bottom: { x: box.x + box.w / 2, y: box.y + box.h },
    left: { x: box.x, y: box.y + box.h / 2 },
  };
  return points[anchor] || points.right;
}

function measureNode(node) {
  if (node.kind === "decision") return { x: node.x, y: node.y, w: 210, h: 132 };
  if (node.kind === "bubble") return { x: node.x, y: node.y, w: 286, h: 120 };
  if (node.kind === "image") return { x: node.x, y: node.y, w: 300, h: 180 };
  return { x: node.x, y: node.y, w: 282, h: 90 };
}

function selectNode(id) {
  state.previousId = state.selectedId === id ? state.previousId : state.selectedId;
  state.selectedId = id;
  state.selectedEdgeId = null;
  state.selectedFrameId = null;
  render();
}

function selectEdge(id) {
  state.selectedEdgeId = id;
  state.selectedId = null;
  state.selectedFrameId = null;
  state.connectFromId = null;
  render();
}

function syncInspector() {
  const node = getNode(state.selectedId);
  const hasNode = Boolean(node);
  controls.title.disabled = !hasNode;
  controls.desc.disabled = !hasNode;
  controls.kind.disabled = !hasNode;
  controls.deleteNode.disabled = !hasNode;
  controls.linkSelected.disabled = !hasNode || !state.previousId;
  controls.connectMode.disabled = !hasNode;
  controls.reverseEdge.disabled = !state.selectedEdgeId;
  controls.straightenEdge.disabled = !state.selectedEdgeId;
  controls.deleteEdge.disabled = !state.selectedEdgeId;
  controls.edgeStatus.textContent = edgeStatusText();
  controls.code.textContent = node ? node.code : "未选中";
  controls.title.value = node?.title || "";
  controls.desc.value = node?.desc || "";
  controls.kind.value = node?.kind || "red";
}

function edgeStatusText() {
  if (state.connectFromId) return `从 ${getNode(state.connectFromId)?.code || "节点"} 连出`;
  const item = getEdge(state.selectedEdgeId);
  if (!item) return "未选中";
  return `${getNode(item.from)?.code || "?"} → ${getNode(item.to)?.code || "?"}`;
}

function applyView() {
  stage.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.scale})`;
  controls.zoomRange.value = Math.round(state.view.scale * 100);
  controls.zoomReadout.textContent = `${Math.round(state.view.scale * 100)}%`;
}

function setZoom(nextScale, anchor = null) {
  const oldScale = state.view.scale;
  const scale = clamp(nextScale, 0.2, 1.8);
  if (anchor) {
    const stageX = (anchor.x - state.view.x) / oldScale;
    const stageY = (anchor.y - state.view.y) / oldScale;
    state.view.x = anchor.x - stageX * scale;
    state.view.y = anchor.y - stageY * scale;
  }
  state.view.scale = scale;
  applyView();
  saveState();
}

function fitToContent() {
  const boxes = [...state.nodes.map(measureNode), ...state.frames.map((frame) => ({ x: frame.x, y: frame.y, w: frame.w, h: frame.h }))];
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.w));
  const maxY = Math.max(...boxes.map((box) => box.y + box.h));
  const padding = 80;
  state.view.scale = clamp(Math.min((viewport.clientWidth - padding * 2) / (maxX - minX), (viewport.clientHeight - padding * 2) / (maxY - minY)), 0.2, 1.8);
  state.view.x = padding - minX * state.view.scale;
  state.view.y = padding - minY * state.view.scale;
  applyView();
  saveState();
}

function startNodeDrag(event) {
  event.stopPropagation();
  const id = event.currentTarget.dataset.id;
  selectNode(id);
  const node = getNode(id);
  dragNode = { id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y };
  event.currentTarget.setPointerCapture(event.pointerId);
}

function startFrameInteraction(event) {
  const frame = getFrame(event.currentTarget.dataset.id);
  if (!frame) return;
  state.selectedFrameId = frame.id;
  state.selectedId = null;
  state.selectedEdgeId = null;
  const resizeTarget = event.target.closest("[data-role='resize']");
  const titleTarget = event.target.closest("[data-role='title']");
  if (resizeTarget) {
    resizeFrame = { id: frame.id, startX: event.clientX, startY: event.clientY, w: frame.w, h: frame.h };
  } else if (titleTarget || event.target === event.currentTarget) {
    dragFrame = { id: frame.id, startX: event.clientX, startY: event.clientY, x: frame.x, y: frame.y };
  }
  event.currentTarget.setPointerCapture(event.pointerId);
  render();
}

viewport.addEventListener("pointerdown", (event) => {
  if (event.target !== viewport && event.target !== stage && !event.target.classList.contains("infinite-grid")) return;
  pan = { startX: event.clientX, startY: event.clientY, viewX: state.view.x, viewY: state.view.y };
  viewport.classList.add("panning");
});

window.addEventListener("pointermove", (event) => {
  if (dragNode) {
    const node = getNode(dragNode.id);
    node.x = dragNode.nodeX + (event.clientX - dragNode.startX) / state.view.scale;
    node.y = dragNode.nodeY + (event.clientY - dragNode.startY) / state.view.scale;
    render();
    return;
  }
  if (dragFrame) {
    const frame = getFrame(dragFrame.id);
    frame.x = dragFrame.x + (event.clientX - dragFrame.startX) / state.view.scale;
    frame.y = dragFrame.y + (event.clientY - dragFrame.startY) / state.view.scale;
    render();
    return;
  }
  if (resizeFrame) {
    const frame = getFrame(resizeFrame.id);
    frame.w = Math.max(320, resizeFrame.w + (event.clientX - resizeFrame.startX) / state.view.scale);
    frame.h = Math.max(280, resizeFrame.h + (event.clientY - resizeFrame.startY) / state.view.scale);
    render();
    return;
  }
  if (dragEdge) {
    const item = getEdge(dragEdge.id);
    if (item) item.mid = stagePoint(event);
    render();
    return;
  }
  if (pan) {
    state.view.x = pan.viewX + event.clientX - pan.startX;
    state.view.y = pan.viewY + event.clientY - pan.startY;
    applyView();
    saveState();
  }
});

window.addEventListener("pointerup", () => {
  dragNode = null;
  dragFrame = null;
  resizeFrame = null;
  dragEdge = null;
  pan = null;
  viewport.classList.remove("panning");
});

viewport.addEventListener("wheel", (event) => {
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    const rect = viewport.getBoundingClientRect();
    setZoom(state.view.scale + (event.deltaY > 0 ? -0.08 : 0.08), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    return;
  }
  state.view.x -= event.shiftKey ? event.deltaY : event.deltaX;
  state.view.y -= event.shiftKey ? 0 : event.deltaY;
  applyView();
  saveState();
}, { passive: false });

viewport.addEventListener("dragover", (event) => {
  if (!hasImageFile(event.dataTransfer)) return;
  event.preventDefault();
  viewport.classList.add("drop-ready");
});

viewport.addEventListener("dragleave", (event) => {
  if (!viewport.contains(event.relatedTarget)) viewport.classList.remove("drop-ready");
});

viewport.addEventListener("drop", (event) => {
  if (!hasImageFile(event.dataTransfer)) return;
  event.preventDefault();
  viewport.classList.remove("drop-ready");
  const targetNode = event.target.closest(".flow-node");
  const targetId = targetNode?.dataset.id || state.selectedId;
  if (targetId) {
    readImageFile(event.dataTransfer.files[0], targetId);
    return;
  }
  createImageNodeFromFile(event.dataTransfer.files[0], stagePoint(event));
});

controls.title.addEventListener("input", () => updateSelected({ title: controls.title.value }));
controls.desc.addEventListener("input", () => updateSelected({ desc: controls.desc.value }));
controls.kind.addEventListener("change", () => updateSelected({ kind: controls.kind.value }));
controls.zoomRange.addEventListener("input", () => setZoom(Number(controls.zoomRange.value) / 100));
controls.zoomOut.addEventListener("click", () => setZoom(state.view.scale - 0.1));
controls.zoomIn.addEventListener("click", () => setZoom(state.view.scale + 0.1));
controls.fitView.addEventListener("click", fitToContent);
controls.actualSize.addEventListener("click", () => setZoom(1));
controls.connectMode.addEventListener("click", () => {
  if (!state.selectedId) return;
  state.connectFromId = state.selectedId;
  state.pendingConnection = { from: state.selectedId, fromAnchor: "right" };
  render();
});
controls.reverseEdge.addEventListener("click", () => {
  const item = getEdge(state.selectedEdgeId);
  if (!item) return;
  [item.from, item.to] = [item.to, item.from];
  [item.fromAnchor, item.toAnchor] = [item.toAnchor, item.fromAnchor];
  item.mid = null;
  render();
});
controls.straightenEdge.addEventListener("click", () => {
  const item = getEdge(state.selectedEdgeId);
  if (!item) return;
  item.mid = null;
  render();
});
controls.deleteEdge.addEventListener("click", () => {
  state.edges = state.edges.filter((item) => item.id !== state.selectedEdgeId);
  state.selectedEdgeId = null;
  render();
});
window.addEventListener("resize", () => applyView());

controls.addNode.addEventListener("click", () => addNode("red", "新流程节点", "补充这个分支里的判断、输入、产出或截图说明。"));
controls.addDecision.addEventListener("click", () => addNode("decision", "几种方案中选择这一种", "记录方案、取舍原因和风险。"));
controls.addNote.addEventListener("click", () => addNode("white", "备注依据", "记录访谈、竞品、工具询问或版本反馈。"));
controls.addShot.addEventListener("click", () => addNode("image", "流程截图", "双击截图区域或点击左侧上传按钮添加照片。"));

controls.imageInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  const node = getNode(state.selectedId);
  if (!file || !node) return;
  readImageFile(file, node.id);
  event.target.value = "";
});

controls.importJson.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(reader.result));
      render();
    } catch {
      alert("导入失败：这个 JSON 文件格式不对。");
    }
  };
  reader.readAsText(file, "utf-8");
  event.target.value = "";
});

controls.deleteNode.addEventListener("click", () => {
  if (!state.selectedId) return;
  state.nodes = state.nodes.filter((node) => node.id !== state.selectedId);
  state.edges = state.edges.filter((item) => item.from !== state.selectedId && item.to !== state.selectedId);
  state.selectedId = state.nodes[0]?.id || null;
  render();
});

controls.linkSelected.addEventListener("click", () => {
  if (!state.previousId || !state.selectedId || state.previousId === state.selectedId) return;
  addEdge(state.previousId, state.selectedId, "green");
  render();
});

controls.exportJson.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "decision-infinite-canvas.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

controls.resetBoard.addEventListener("click", () => {
  state = normalizeState(clone(initialState));
  render();
});

function addNode(kind, title, desc) {
  const selected = getNode(state.selectedId);
  const count = state.nodes.length + 1;
  const node = {
    id: `node-${Date.now()}`,
    code: `N${count}`,
    kind,
    x: selected ? selected.x + 330 : (viewport.clientWidth / 2 - state.view.x) / state.view.scale,
    y: selected ? selected.y + 120 : (viewport.clientHeight / 2 - state.view.y) / state.view.scale,
    title,
    desc,
    meta: "自定义",
  };
  state.nodes.push(node);
  if (state.selectedId) addEdge(state.selectedId, node.id, kind === "red" ? "red" : "green");
  selectNode(node.id);
}

function readImageFile(file, nodeId) {
  if (!file || !file.type.startsWith("image/")) return;
  const node = getNode(nodeId);
  if (!node) return;
  imageFileToDataUrl(file).then((dataUrl) => {
    node.kind = "image";
    node.image = dataUrl;
    if (!node.title || node.title === "流程截图") node.title = file.name.replace(/\.[^.]+$/, "");
    render();
  });
}

function createImageNodeFromFile(file, point) {
  const node = {
    id: `node-${Date.now()}`,
    code: `N${state.nodes.length + 1}`,
    kind: "image",
    x: point.x,
    y: point.y,
    title: "流程截图",
    desc: "拖入上传的截图。",
    meta: "自定义",
  };
  state.nodes.push(node);
  state.selectedId = node.id;
  readImageFile(file, node.id);
}

function hasImageFile(dataTransfer) {
  return Array.from(dataTransfer?.files || []).some((file) => file.type.startsWith("image/"));
}

function addEdge(from, to, tone = "green", fromAnchor = "right", toAnchor = "left") {
  if (from === to) return;
  const exists = state.edges.some((item) => item.from === from && item.to === to && item.fromAnchor === fromAnchor && item.toAnchor === toAnchor);
  if (!exists) state.edges.push(edge(from, to, tone, null, fromAnchor, toAnchor));
}

function handleConnectorClick(nodeId, anchor) {
  if (!state.pendingConnection) {
    state.pendingConnection = { from: nodeId, fromAnchor: anchor };
    state.connectFromId = nodeId;
    state.selectedId = nodeId;
    state.selectedEdgeId = null;
    render();
    return;
  }
  if (state.pendingConnection.from === nodeId) {
    state.pendingConnection = { from: nodeId, fromAnchor: anchor };
    state.connectFromId = nodeId;
    render();
    return;
  }
  addEdge(state.pendingConnection.from, nodeId, edgeToneFor(state.pendingConnection.from, nodeId), state.pendingConnection.fromAnchor, anchor);
  state.pendingConnection = null;
  state.connectFromId = null;
  render();
}

function edgeToneFor(from, to) {
  const fromKind = getNode(from)?.kind;
  const toKind = getNode(to)?.kind;
  if (fromKind === "red" || toKind === "red") return "red";
  if (fromKind === "white" || toKind === "white") return "white";
  return "green";
}

function updateSelected(patch) {
  const node = getNode(state.selectedId);
  if (!node) return;
  Object.assign(node, patch);
  render();
}

function stagePoint(event) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left - state.view.x) / state.view.scale,
    y: (event.clientY - rect.top - state.view.y) / state.view.scale,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
setupRemoteSync();

async function setupRemoteSync() {
  if (!location.protocol.startsWith("http")) return;
  try {
    const response = await fetch("/api/state");
    const remoteState = await response.json();
    if (remoteState && remoteState.nodes && remoteState.edges) {
      applyingRemoteState = true;
      state = normalizeState(remoteState);
      render();
      applyingRemoteState = false;
    }
  } catch {
    return;
  }

  const events = new EventSource("/api/events");
  events.addEventListener("state", (event) => {
    try {
      applyingRemoteState = true;
      state = normalizeState(JSON.parse(event.data));
      render();
    } finally {
      applyingRemoteState = false;
    }
  });
}

async function pushRemoteState(serialized = JSON.stringify(state)) {
  try {
    await fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: serialized,
    });
  } catch {
    // Local editing still works if the optional sync server is unavailable.
  }
}

function imageFileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1600;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => resolve(reader.result);
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
