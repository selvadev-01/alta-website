/** Every scene is one 5 second clip (public/video/<key>.mp4) with a still poster (public/img/<key>.webp). */

export type ChapterId = "project" | "flat" | "rooms";

/** how the scene arrives: outside scenes and the lift use lift doors, rooms open from a doorway */
export type Zone = "outside" | "room";

/** rooms on the sample floor plan */
export type PlanRoom = "living" | "dining" | "kitchen" | "bedroom" | "bathroom" | "study" | "kids" | "balcony";

export type Scene = {
  key: string;
  chapter: ChapterId;
  /** lift floor shown on the display: 0 is the ground floor */
  floor: number;
  zone: Zone;
  plan?: PlanRoom;
  /** short name for the scene list */
  name: string;
  /** headline over the film */
  title: string;
  /** one supporting sentence */
  line: string;
  /** what the picture shows, for screen readers */
  alt: string;
};

export const chapters: { id: ChapterId; label: string }[] = [
  { id: "project", label: "The project" },
  { id: "flat", label: "Your flat" },
  { id: "rooms", label: "The rooms" },
];

/** the floor of the flat in the film (sample) */
export const FLAT_FLOOR = 18;

export const scenes: Scene[] = [
  { key: "gate", chapter: "project", floor: 0, zone: "outside", name: "The gate", title: "A private drive home.", line: "One guarded entrance, lined with palms.", alt: "Entrance gate with a security cabin and a palm-lined driveway" },
  { key: "lobby", chapter: "project", floor: 0, zone: "outside", name: "The lobby", title: "Someone at the desk, day and night.", line: "A double-height welcome before the lift takes you up.", alt: "Lobby with a bronze spiral staircase and a green marble reception desk" },
  { key: "tower", chapter: "flat", floor: FLAT_FLOOR, zone: "outside", name: "Floor 18", title: "Which one is yours?", line: "Every home has floor-to-ceiling glass and a deep balcony.", alt: "A residential tower at dusk with dark windows reflecting the sky" },
  { key: "flat", chapter: "flat", floor: FLAT_FLOOR, zone: "outside", name: "Your flat", title: "This one. Step inside.", line: "A corner home, lights on, doors open to the balcony.", alt: "One lit corner flat seen from outside, its living room visible through open balcony doors" },
  { key: "living", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "living", name: "Living room", title: "A living room that faces the skyline.", line: "Corner windows, a fireplace wall and room for everyone.", alt: "Living room with a curved sofa, a fireplace wall and a skyline view at golden hour" },
  { key: "dining", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "dining", name: "Dining", title: "Room for eight at the table.", line: "With the city lights for company.", alt: "Dining table set for eight under a chandelier at twilight" },
  { key: "kitchen", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "kitchen", name: "Kitchen", title: "A kitchen built for real cooking.", line: "A marble island, tall storage and a view while you cook.", alt: "Kitchen with a marble island, leather stools and a steaming pan" },
  { key: "bedroom", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "bedroom", name: "Master bedroom", title: "Wake up to the first light.", line: "A quiet room with the dawn in the window.", alt: "Master bedroom at dawn with a suede headboard and a skyline view" },
  { key: "bathroom", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "bathroom", name: "Bathroom", title: "A bathroom that feels like a spa.", line: "A stone tub by the window and a walk-in rain shower.", alt: "Bathroom with a freestanding stone bathtub, round mirrors and a glass shower" },
  { key: "study", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "study", name: "Study", title: "A proper room to work in.", line: "A desk by the window and a wall of shelves.", alt: "Study with a walnut desk, a lit library wall and a window seat" },
  { key: "kids", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "kids", name: "Children's room", title: "A room they will not want to leave.", line: "Space to sleep, read and play.", alt: "Children's bedroom with a bunk bed with a slide, a canopy and a telescope" },
  { key: "balcony", chapter: "rooms", floor: FLAT_FLOOR, zone: "room", plan: "balcony", name: "Balcony", title: "Every evening, this.", line: "Outside space with the whole city in front of you.", alt: "Balcony with a glass railing at sunset over a city and a park" },
];

export const firstSceneOf = (id: ChapterId) => scenes.findIndex((s) => s.chapter === id);

/** sample floor plan of the flat in the film, in a 200 x 140 box */
export const plan: { id: PlanRoom; label: string; x: number; y: number; w: number; h: number }[] = [
  { id: "balcony", label: "Balcony", x: 0, y: 0, w: 200, h: 20 },
  { id: "living", label: "Living", x: 0, y: 20, w: 88, h: 58 },
  { id: "dining", label: "Dining", x: 88, y: 20, w: 56, h: 58 },
  { id: "kitchen", label: "Kitchen", x: 144, y: 20, w: 56, h: 58 },
  { id: "bedroom", label: "Bed", x: 0, y: 78, w: 70, h: 62 },
  { id: "bathroom", label: "Bath", x: 70, y: 78, w: 36, h: 62 },
  { id: "study", label: "Study", x: 106, y: 78, w: 44, h: 62 },
  { id: "kids", label: "Kids", x: 150, y: 78, w: 50, h: 62 },
];

export type Amenity = { key: string; name: string; line: string; alt: string };

export const amenities: Amenity[] = [
  { key: "pool", name: "The pool", line: "A resort pool, downstairs.", alt: "Swimming pool with sun loungers, palms and the towers behind" },
  { key: "gym", name: "The gym", line: "Train before work without leaving home.", alt: "Gym with boxing bags, treadmills and a glass wall onto the garden" },
  { key: "clubhouse", name: "The clubhouse", line: "A bar, a fire, a library and a billiards table. Yours to book.", alt: "Clubhouse lounge with a marble bar, a stone fireplace and a billiards table" },
  { key: "garden", name: "The gardens", line: "A jogging track, lawns and a play area between the towers.", alt: "Landscaped garden with a jogging track and a children's play area" },
];

export type HomeId = "two" | "three" | "four";

export type Home = {
  id: HomeId;
  name: string;
  /** sample figures until the developer supplies real ones */
  area: string;
  rooms: string[];
  line: string;
  image: string;
  alt: string;
};

export const homes: Home[] = [
  {
    id: "two",
    name: "2 bedroom",
    area: "1,180 sq ft",
    rooms: ["Living and dining", "Kitchen with island", "2 bedrooms", "2 bathrooms", "Balcony"],
    line: "A first home with a full-size kitchen and a balcony you will use.",
    image: "kitchen",
    alt: "Kitchen with a marble island",
  },
  {
    id: "three",
    name: "3 bedroom",
    area: "1,640 sq ft",
    rooms: ["Corner living room", "Dining for eight", "Kitchen with island", "3 bedrooms", "3 bathrooms", "Study", "Balcony"],
    line: "The corner home from the film, with glass on two sides.",
    image: "living",
    alt: "Corner living room with a skyline view",
  },
  {
    id: "four",
    name: "4 bedroom",
    area: "2,350 sq ft",
    rooms: ["Corner living room", "Formal dining", "Kitchen and utility", "4 bedrooms", "4 bathrooms", "Study", "Children's room", "2 balconies"],
    line: "A whole floor corner for a larger family.",
    image: "dining",
    alt: "Dining room set for eight",
  },
];

export const facts: { value: string; label: string }[] = [
  { value: "2", label: "towers" },
  { value: "24", label: "floors each" },
  { value: "3", label: "home sizes" },
  { value: "5", label: "shared spaces" },
];
