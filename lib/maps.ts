export async function searchPlaces(keyword: string, location: string = "Rajkot") {
  const apiKey = process.env.GOOGLE_PLACE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_M_API_KEY;
  
  if (!apiKey) throw new Error("GOOGLE_PLACE_API_KEY missing");

  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.reviews"
    },
    body: JSON.stringify({ textQuery: `${keyword} in ${location}`, maxResultCount: 20 })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.places || [];
}
