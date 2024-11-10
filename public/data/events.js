const eventData = [
  {
    id: 1,
    title: "Sunset Yoga at the Park",
    description:
      "Join us for a rejuvenating yoga session as we watch the sunset. Beginners welcome!",
    date: "2024-08-10",
    time: "18:30",
    location: "Chinguacousy Park, Brampton, ON",
    category: "Health & Wellness",
    price: "Free",
    image:
      "https://th.bing.com/th/id/OIP.P7G5-T9Xutk4zDZmfW8ttgHaE7?w=274&h=183&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 50,
  },
  {
    id: 2,
    title: "Outdoor Jazz Concert",
    description:
      "An evening of live jazz music under the stars with top local musicians. Bring your blanket and enjoy the vibe!",
    date: "2024-08-12",
    time: "20:00",
    location: "Gage Park, Brampton, ON",
    category: "Music",
    price: "$20",
    image:
      "https://static.wixstatic.com/media/d16e40_e94ba7d63ff041b9b6c7469d254f24b8~mv2.jpeg/v1/fill/w_1000,h_626,al_c,q_90,usm_0.66_1.00_0.01/d16e40_e94ba7d63ff041b9b6c7469d254f24b8~mv2.jpeg",
    participants: 200,
  },
  {
    id: 3,
    title: "Rock Climbing Adventure",
    description:
      "Perfect for beginners and pros alike, this climbing event includes guided climbs and equipment rentals.",
    date: "2024-09-05",
    time: "10:00",
    location: "Heart Lake Conservation Park, Brampton, ON",
    category: "Sports",
    price: "$50",
    image:
      "https://th.bing.com/th/id/OIP.Jc_88cgCRv4SzombkgMuNgHaEL?w=287&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 30,
  },
  {
    id: 4,
    title: "Farmers' Market & Artisan Fair",
    description:
      "Discover fresh produce, handmade crafts, and unique finds from local vendors. Family-friendly and pet-friendly!",
    date: "2024-09-10",
    time: "08:00 - 15:00",
    location: "Downtown Brampton, ON",
    category: "Market",
    price: "Free",
    image:
      "https://th.bing.com/th?id=OIP.6YrxC38SM-1GhwH5x-7gggHaE8&w=306&h=204&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    participants: 500,
  },
  {
    id: 5,
    title: "Wine Tasting and Vineyard Tour",
    description:
      "Spend an afternoon tasting locally produced wines and learning about the winemaking process.",
    date: "2024-09-15",
    time: "13:00",
    location: "Alvento Winery, Brampton, ON",
    category: "Food & Drink",
    price: "$45",
    image:
      "https://th.bing.com/th/id/OIP.wkWWiQJftV-iugYV7TgUsAHaE8?w=269&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 100,
  },
  {
    id: 6,
    title: "Outdoor Movie Night: Classic Films",
    description:
      "Enjoy classic movies on a large outdoor screen. Bring your picnic blankets and chairs!",
    date: "2024-09-20",
    time: "19:30",
    location: "Chinguacousy Park, Brampton, ON",
    category: "Entertainment",
    price: "$10",
    image:
      "https://th.bing.com/th?id=OIP.uYbx2Usn6QRvK5jWSewPCwHaJ4&w=216&h=288&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    participants: 300,
  },
  {
    id: 7,
    title: "Sunrise Hiking & Breakfast",
    description:
      "Start your day with an invigorating hike followed by a healthy outdoor breakfast.",
    date: "2024-09-25",
    time: "05:30",
    location: "Eldorado Park, Brampton, ON",
    category: "Adventure",
    price: "$25",
    image:
      "https://th.bing.com/th?id=OIP.wkFedfgYCcJ3PMbazc0e8wHaFj&w=288&h=216&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    participants: 20,
  },
  {
    id: 8,
    title: "Summer Food Truck Festival",
    description:
      "Explore a variety of gourmet food trucks offering everything from tacos to ice cream.",
    date: "2024-10-05",
    time: "11:00 - 21:00",
    location: "Garden Square, Brampton, ON",
    category: "Food & Drink",
    price: "Free entry (food priced per vendor)",
    image:
      "https://th.bing.com/th/id/OIP.zbhXbwOzjJVBodcVKjWI3wHaJQ?w=131&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 800,
  },
  {
    id: 9,
    title: "Art in the Park: Outdoor Exhibition",
    description:
      "Stroll through an outdoor art exhibition featuring sculptures, paintings, and live art demonstrations.",
    date: "2024-10-12",
    time: "09:00 - 17:00",
    location: "Gage Park, Brampton, ON",
    category: "Arts",
    price: "Free",
    image:
      "https://th.bing.com/th?id=OIP.gjsSAHWLZ6qVQqHjaQY5WwAAAA&w=306&h=203&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    participants: 600,
  },
  {
    id: 10,
    title: "Biking Marathon",
    description:
      "Join fellow cyclists for a 30-mile biking marathon through scenic trails. Suitable for all skill levels.",
    date: "2024-10-15",
    time: "07:00",
    location: "Heart Lake Conservation Park, Brampton, ON",
    category: "Sports",
    price: "$35",
    image:
      "https://th.bing.com/th/id/OIP.qOfe8uD-7aRmxB2u86JElwHaFj?w=212&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 150,
  },
  {
    id: 11,
    title: "Stargazing Night",
    description:
      "Discover the beauty of the night sky with telescopes and guidance from local astronomers.",
    date: "2024-10-20",
    time: "21:00",
    location: "Chinguacousy Park, Brampton, ON",
    category: "Education",
    price: "$15",
    image:
      "https://th.bing.com/th/id/OIP.yJslhlEtnnA1Yhq6EdRmkAHaGT?w=185&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 50,
  },
  {
    id: 12,
    title: "Marathon for Charity",
    description:
      "Run for a cause! This marathon will benefit local charities. Choose from 5k, 10k, or full marathon options.",
    date: "2024-10-28",
    time: "06:00",
    location: "Downtown Brampton, ON",
    category: "Sports",
    price: "$40",
    image:
      "https://th.bing.com/th/id/OIP.7TOKKl0w1dCThWA2F7c4fwHaE8?w=270&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 1000,
  },
  {
    id: 13,
    title: "Autumn Foliage Photography Workshop",
    description:
      "Capture the beauty of autumn colors in this hands-on photography workshop. DSLR required.",
    date: "2024-11-01",
    time: "09:00",
    location: "Eldorado Park, Brampton, ON",
    category: "Arts",
    price: "$30",
    image:
      "https://th.bing.com/th/id/OIP.RCVt187Zdgb4OSYpLuHO2AHaE7?w=288&h=191&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    participants: 20,
  },
];

export default eventData;
