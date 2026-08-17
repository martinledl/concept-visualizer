export type FoundationLesson = {
  slug: string;
  steps: Array<{
    title: string;
    short: string;
    operation: string;
    description: string;
    note: string;
  }>;
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
  clipping: {
    slug: "clipping",
    steps: [
      { short: "Classify", title: "Check each vertex", operation: "Inside or outside test", description: "Move the triangle across the blue view boundary. Each vertex is classified as inside or outside.", note: "A triangle can cross the boundary even when one or two vertices remain visible." },
      { short: "Intersect", title: "Cut edges at the boundary", operation: "Edge intersection", description: "Every crossing edge is cut where it meets the boundary. Those crossing points become new vertices.", note: "Clipping creates a new polygon. It does not simply hide the old one." },
      { short: "Keep", title: "Send only the visible polygon onward", operation: "Visible polygon output", description: "The clipped polygon continues through the pipeline. The discarded portion no longer consumes later work.", note: "Move the triangle until it is fully inside, partly clipped, and fully outside." },
    ],
    valueLabel: "Triangle position", valueMin: -70, valueMax: 70, valueDefault: 0, valueUnit: "%", toggleLabel: "Show discarded area", toggleDefault: true,
    glossary: [{ term: "Clip boundary", definition: "The limit of the visible region." }, { term: "Intersection", definition: "A new point where an edge crosses the boundary." }],
  },
  "viewport-transform": {
    slug: "viewport-transform",
    steps: [
      { short: "Input", title: "Start with a normalized point", operation: "Read NDC position", description: "Move the point through normalized device coordinates. This device-independent X value stays between -1 and +1.", note: "The same normalized point can be sent to many viewport sizes." },
      { short: "Scale", title: "Scale the normalized range", operation: "Viewport scale", description: "The transform turns the two-unit NDC range into the full pixel width of the viewport.", note: "A wider viewport produces a larger pixel coordinate for the same normalized point." },
      { short: "Place", title: "Place the point in image space", operation: "Viewport translation", description: "The scaled value is shifted to the viewport origin. The result is a usable pixel coordinate.", note: "This lab maps X only. A complete viewport transform also maps Y and depth." },
    ],
    valueLabel: "Normalized X", valueMin: -100, valueMax: 100, valueDefault: 35, valueUnit: "%", toggleLabel: "Use 1920 px viewport", toggleDefault: true,
    glossary: [{ term: "NDC", definition: "Normalized device coordinates after projection." }, { term: "Viewport", definition: "The pixel rectangle that receives the image." }],
  },
  "back-face-culling": {
    slug: "back-face-culling",
    steps: [
      { short: "Order", title: "Read the face indices", operation: "Vertex order", description: "A face record connects vertices in a specific order. Reverse that order to reverse the triangle's winding.", note: "Clockwise and counter-clockwise are conventions chosen by the renderer." },
      { short: "Measure", title: "Measure the signed screen area", operation: "Orientation test", description: "The sign of the projected area tells the renderer which way the face is wound. Rotate the face to see the area shrink near an edge-on view.", note: "Mirroring a model can reverse its winding and change the result." },
      { short: "Cull", title: "Skip the configured back face", operation: "Back-face rejection", description: "Here, clockwise faces are treated as backs and removed before rasterization.", note: "Disable culling for surfaces that are meant to be visible from both sides." },
    ],
    valueLabel: "View rotation", valueMin: -80, valueMax: 80, valueDefault: 20, valueUnit: " deg", toggleLabel: "Reverse face indices", toggleDefault: false,
    glossary: [{ term: "Winding", definition: "The clockwise or counter-clockwise order of a face's vertices." }, { term: "Culling", definition: "Skipping faces that point away from the viewer." }],
  },
  "depth-testing": {
    slug: "depth-testing",
    steps: [
      { short: "Draw", title: "Draw the two surfaces", operation: "Fragment submission", description: "Coral is submitted first and blue second. With no depth test, blue overwrites the overlap because it arrives last.", note: "Turn off the depth test to see submission order control the image." },
      { short: "Compare", title: "Compare both depth values", operation: "Depth comparison", description: "At every overlapping sample, the incoming depth is compared with the closest stored depth.", note: "This lab treats smaller values as closer to the camera." },
      { short: "Keep", title: "Keep the closer fragment", operation: "Depth buffer update", description: "The closer fragment updates both color and stored depth, so opaque surfaces no longer depend on draw order.", note: "Transparent surfaces still need a separate ordering strategy." },
    ],
    valueLabel: "Blue surface depth", valueMin: 5, valueMax: 95, valueDefault: 35, valueUnit: "%", toggleLabel: "Enable depth test", toggleDefault: true,
    glossary: [{ term: "Depth buffer", definition: "Per-pixel storage for the closest depth found so far." }, { term: "Occlusion", definition: "One surface hiding another from the camera." }],
  },
  "z-fighting": {
    slug: "z-fighting",
    steps: [
      { short: "Place", title: "Place two surfaces close together", operation: "Continuous depth input", description: "Move two almost coplanar surfaces apart by a few micro-units. Their real depths are different, but only slightly.", note: "The problem becomes more common when useful depth precision is spread over a large range." },
      { short: "Store", title: "Round depth into storage buckets", operation: "Depth quantization", description: "The depth buffer stores one of a finite set of values. Nearby depths can round into the same bucket.", note: "Switch precision to change the bucket size in this simplified model." },
      { short: "Compete", title: "See why the winner becomes unstable", operation: "Equal-depth competition", description: "When both surfaces store the same value, tiny numerical changes can decide which fragment appears at each sample.", note: "Increase separation until the stored bucket numbers become different." },
    ],
    valueLabel: "Surface separation", valueMin: 0, valueMax: 100, valueDefault: 8, valueUnit: " micro-units", toggleLabel: "Use finer precision", toggleDefault: false,
    glossary: [{ term: "Quantization", definition: "Rounding a continuous value to one stored level." }, { term: "Z-fighting", definition: "Unstable visibility between surfaces with nearly equal depth." }],
  },
  "image-buffers": {
    slug: "image-buffers",
    steps: [
      { short: "Grid", title: "Start with an 8 by 6 image", operation: "Pixel grid", description: "The sample buffer contains 48 pixels arranged in rows and columns.", note: "Real buffers are usually much larger, but the storage rule is the same." },
      { short: "Encode", title: "Choose what each stored value means", operation: "Pixel encoding", description: "Bits per pixel set how many distinct values one pixel can store. A value may be a palette index or a direct intensity.", note: "An 8-bit palette can point to 256 colors without storing each full color in the image." },
      { short: "Size", title: "Calculate the minimum memory", operation: "Buffer size calculation", description: "Multiply pixel count by bits per pixel, then divide by eight to convert bits to bytes.", note: "Real formats may add row padding, metadata, or alignment." },
    ],
    valueLabel: "Bits per pixel", valueMin: 1, valueMax: 24, valueDefault: 8, valueUnit: " bpp", toggleLabel: "Treat values as palette indices", toggleDefault: true,
    glossary: [{ term: "Color depth", definition: "The number of bits used to encode one pixel." }, { term: "Palette", definition: "A table that maps stored indices to full colors." }],
  },
  "frame-timing": {
    slug: "frame-timing",
    steps: [
      { short: "Render", title: "Finish frames on the application's clock", operation: "Frame rendering", description: "Set how long the application needs to produce one complete frame. The display runs on a separate clock.", note: "Rendering faster does not guarantee a clean scanout when both sides share one changing buffer." },
      { short: "Scan", title: "Read the display one row at a time", operation: "Display scanout", description: "A 60 Hz display scans one frame over roughly 16.7 ms. A buffer change during that scan can split the image.", note: "Turn off double buffering with a short render time to expose the tearing case." },
      { short: "Present", title: "Present only complete buffers", operation: "Buffered swap", description: "Double buffering keeps one complete frame available for scanout while the next is being drawn elsewhere.", note: "A frame that misses the refresh boundary waits, so the previous frame appears again." },
    ],
    valueLabel: "Frame render time", valueMin: 5, valueMax: 40, valueDefault: 17, valueUnit: " ms", toggleLabel: "Use double buffering", toggleDefault: true,
    glossary: [{ term: "Tearing", definition: "One scanout showing parts of different frames." }, { term: "VSync", definition: "Scheduling presentation around display refresh boundaries." }],
  },
  "obj-mesh": {
    slug: "obj-mesh",
    steps: [
      { short: "Vertices", title: "Read the stored positions", operation: "Vertex records", description: "Each OBJ v record adds one position to a numbered list. The four records here describe the corners of a tetrahedron.", note: "Ordinary OBJ face indices start at one, not zero." },
      { short: "Faces", title: "Follow one face record", operation: "Index lookup", description: "Select an f record and follow its three indices back to the positions it connects.", note: "Changing the order changes the face winding even when it uses the same positions." },
      { short: "Mesh", title: "Build a surface from shared records", operation: "Mesh assembly", description: "Four indexed faces reuse the same four positions to form a closed surface.", note: "OBJ can also reference texture coordinates and normals." },
    ],
    valueLabel: "Selected face", valueMin: 1, valueMax: 4, valueDefault: 1, valueUnit: "", toggleLabel: "Show vertex labels", toggleDefault: true,
    glossary: [{ term: "Vertex", definition: "A stored position that faces can reference." }, { term: "Face", definition: "An ordered boundary made from vertex indices." }],
  },
};

export const foundationLessonSlugs = ["graphics-pipeline", ...Object.keys(foundationLessons)];
