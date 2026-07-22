export async function searchPlaces(keyword: string, location: string = "Rajkot") {
  const apiKey = (process.env.GOOGLE_PLACE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY) as string;
  if (!apiKey) throw new Error("GOOGLE_PLACE_API_KEY missing");
  const query = `${keyword} in ${location}`;
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message || `Google Error: ${data.status}`);
  }
  const results = data.results || [];
  const detailed = await Promise.all(
    results.slice(0, 15).map(async (place: any) => {
      try {
        const dUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${apiKey}`;
        const dRes = await fetch(dUrl);
        const dData = await dRes.json();
        return {
          displayName: { text: place.name },
          formattedAddress: place.formatted_address || "",
          rating: place.rating || 0,
          userRatingCount: place.user_ratings_total || 0,
          nationalPhoneNumber: dData.result?.formatted_phone_number || "",
          websiteUri: dData.result?.website || null,
          types: place.types || [],
        };
      } catch {
        return {
          displayName: { text: place.name },
          formattedAddress: place.formatted_address || "",
          rating: place.rating || 0,
          userRatingCount: place.user_ratings_total || 0,
          nationalPhoneNumber: "",
          websiteUri: null,
          types: place.types || [],
        };
      }
    })
  );
  return detailed;
}
