export type FoundationLesson = {
  slug: string;
  steps: Array<{ title: string; short: string; description: string; note: string }>;
  valueLabel: string;
  valueMin: number;
  valueMax: number;
  valueDefault: number;
  valueUnit: string;
  toggleLabel: string;
  toggleDefault: boolean;
  glossary: Array<{ term: string; definition: string }>;
};

export const foundationLessons: Record<string, FoundationLesson> = {
  "graphics-pipeline": {
    slug: "graphics-pipeline",
    steps: [
      { short: "Place", title: "Start with a model", description: "Vertices begin in a local coordinate system that is convenient for describing one object.", note: "A scene can contain many models, each with its own local coordinates." },
      { short: "Transform", title: "Move between spaces", description: "Transforms express the same geometry relative to the world, camera, and canonical view volume.", note: "The coordinates change; the intended object does not." },
      { short: "Image", title: "Produce samples", description: "Clipping, viewport mapping, and rasterization turn projected geometry into fragments in image space.", note: "A fragment is still a candidate contribution to a pixel." },
    ],
    valueLabel: "Pipeline progress", valueMin: 0, valueMax: 5, valueDefault: 2, valueUnit: " stage", toggleLabel: "Show coordinates", toggleDefault: true,
    glossary: [{ term: "Coordinate system", definition: "A frame used to express positions." }, { term: "Transform", definition: "A mapping that moves coordinates between spaces." }],
  },
  clipping: {
    slug: "clipping",
    steps: [
      { short: "Classify", title: "Classify the vertices", description: "Each vertex lies inside or outside the visible boundary.", note: "A primitive is not always entirely accepted or rejected." },
      { short: "Intersect", title: "Find boundary crossings", description: "Edges that cross the boundary create new intersection vertices.", note: "Clipping changes geometry, not merely its color." },
      { short: "Keep", title: "Keep the visible polygon", description: "The outside portion is discarded before later pipeline work.", note: "Early clipping avoids processing geometry that cannot appear." },
    ],
    valueLabel: "Horizontal position", valueMin: -70, valueMax: 70, valueDefault: 10, valueUnit: "%", toggleLabel: "Show discarded area", toggleDefault: true,
    glossary: [{ term: "Clip boundary", definition: "A limit of the visible region." }, { term: "Intersection", definition: "Where an edge crosses that boundary." }],
  },
  "viewport-transform": {
    slug: "viewport-transform",
    steps: [
      { short: "Normalize", title: "Use normalized coordinates", description: "After projection, positions live in a device-independent canonical range.", note: "The simplified lab uses values from -1 to +1." },
      { short: "Scale", title: "Scale to the viewport", description: "The canonical range expands to match the viewport width and height.", note: "Changing resolution changes pixel coordinates, not the normalized point." },
      { short: "Translate", title: "Translate into image space", description: "An offset moves the result to the viewport origin.", note: "Screen Y direction can differ between graphics APIs." },
    ],
    valueLabel: "Normalized X", valueMin: -100, valueMax: 100, valueDefault: 35, valueUnit: "%", toggleLabel: "Wide viewport", toggleDefault: true,
    glossary: [{ term: "NDC", definition: "Normalized device coordinates after projection." }, { term: "Viewport", definition: "The pixel rectangle receiving the image." }],
  },
  "back-face-culling": {
    slug: "back-face-culling",
    steps: [
      { short: "Order", title: "Read the vertex order", description: "A triangle has an orientation because its vertices are listed in sequence.", note: "Clockwise and counter-clockwise are conventions, not intrinsic labels." },
      { short: "Face", title: "Determine the facing side", description: "The signed screen-space area reveals the winding direction.", note: "Mirroring a model can reverse its apparent winding." },
      { short: "Cull", title: "Reject the back face", description: "When culling is enabled, faces with the configured back orientation are skipped.", note: "Culling improves efficiency but is wrong for intentionally two-sided surfaces." },
    ],
    valueLabel: "View rotation", valueMin: -80, valueMax: 80, valueDefault: 20, valueUnit: "°", toggleLabel: "Reverse winding", toggleDefault: false,
    glossary: [{ term: "Winding", definition: "Clockwise or counter-clockwise vertex order." }, { term: "Culling", definition: "Skipping faces that point away from the viewer." }],
  },
  "depth-testing": {
    slug: "depth-testing",
    steps: [
      { short: "Draw", title: "Draw in submission order", description: "Without a depth test, later fragments overwrite earlier ones.", note: "Painter-style rendering makes order part of the result." },
      { short: "Compare", title: "Compare fragment depth", description: "Each fragment is tested against the stored depth at the same pixel.", note: "Near and far conventions depend on the coordinate system." },
      { short: "Keep", title: "Keep the nearest fragment", description: "Passing fragments update both color and depth, making submission order irrelevant.", note: "Transparent surfaces still need additional ordering strategies." },
    ],
    valueLabel: "Blue surface depth", valueMin: 5, valueMax: 95, valueDefault: 35, valueUnit: "%", toggleLabel: "Enable depth test", toggleDefault: true,
    glossary: [{ term: "Depth buffer", definition: "Per-pixel storage for the current closest depth." }, { term: "Occlusion", definition: "One surface hiding another from the camera." }],
  },
  "z-fighting": {
    slug: "z-fighting",
    steps: [
      { short: "Separate", title: "Place two close surfaces", description: "Nearly coplanar surfaces produce depth values that differ only slightly.", note: "At large distances, the representable gaps can become coarse." },
      { short: "Quantize", title: "Store finite precision", description: "A depth buffer rounds continuous values into a finite set of representable levels.", note: "Two distinct surfaces can quantize to the same stored value." },
      { short: "Compete", title: "Watch fragments compete", description: "Tiny numerical changes decide which surface wins from pixel to pixel or frame to frame.", note: "Separating surfaces or improving depth precision addresses the cause." },
    ],
    valueLabel: "Surface separation", valueMin: 0, valueMax: 100, valueDefault: 8, valueUnit: " μ", toggleLabel: "High precision", toggleDefault: false,
    glossary: [{ term: "Quantization", definition: "Rounding a continuous value to a finite level." }, { term: "Z-fighting", definition: "Unstable visibility between nearly equal depths." }],
  },
  "image-buffers": {
    slug: "image-buffers",
    steps: [
      { short: "Grid", title: "Lay out the pixel grid", description: "An image buffer stores a width by height array of pixel values.", note: "Rows usually occupy contiguous regions of memory." },
      { short: "Encode", title: "Choose an encoding", description: "Bits per pixel determine how much information each stored value can contain.", note: "A palette index and a true-color value use those bits differently." },
      { short: "Size", title: "Calculate the memory", description: "The minimum storage is width × height × bits per pixel ÷ 8.", note: "Real buffers may add row padding or alignment." },
    ],
    valueLabel: "Bits per pixel", valueMin: 1, valueMax: 24, valueDefault: 8, valueUnit: " bpp", toggleLabel: "Use color palette", toggleDefault: true,
    glossary: [{ term: "Color depth", definition: "Bits used to encode one pixel." }, { term: "CLUT", definition: "A table mapping stored indices to full colors." }],
  },
  "frame-timing": {
    slug: "frame-timing",
    steps: [
      { short: "Render", title: "Render at an independent rate", description: "The application finishes frames whenever its work completes.", note: "Rendering faster than scanout does not automatically create a cleaner image." },
      { short: "Scan", title: "Scan the display at a fixed rate", description: "The display controller reads rows from the current buffer over one refresh interval.", note: "At 60 Hz, one refresh takes about 16.7 ms." },
      { short: "Swap", title: "Swap complete buffers", description: "Double buffering separates the frame being read from the frame being written.", note: "If rendering misses a refresh boundary, the displayed frame may repeat." },
    ],
    valueLabel: "Frame render time", valueMin: 5, valueMax: 40, valueDefault: 17, valueUnit: " ms", toggleLabel: "Double buffering", toggleDefault: true,
    glossary: [{ term: "Tearing", definition: "One scanout contains parts of different frames." }, { term: "VSync", definition: "Scheduling swaps around display refresh boundaries." }],
  },
  "obj-mesh": {
    slug: "obj-mesh",
    steps: [
      { short: "Vertices", title: "Store vertex positions", description: "Each v record contributes one numbered position to the mesh.", note: "OBJ indices are one-based in ordinary face records." },
      { short: "Faces", title: "Connect vertices into faces", description: "An f record lists the vertex indices around a polygon boundary.", note: "Reordering the indices changes the winding direction." },
      { short: "Mesh", title: "Build the surface", description: "Many shared vertices and faces form a compact boundary representation.", note: "OBJ can also store texture-coordinate and normal indices." },
    ],
    valueLabel: "Selected face", valueMin: 1, valueMax: 4, valueDefault: 1, valueUnit: "", toggleLabel: "Show vertex labels", toggleDefault: true,
    glossary: [{ term: "Vertex", definition: "A stored position referenced by faces." }, { term: "Face", definition: "An ordered polygon boundary made from vertex indices." }],
  },
};

export const foundationLessonSlugs = Object.keys(foundationLessons);
