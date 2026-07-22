export async function searchPlaces(keyword: string, location: string = "Rajkot") {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACE_API_KEY!,
      "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.reviews"
    },
    body: JSON.stringify({ textQuery: `${keyword} in ${location}`, maxResultCount: 20 })
  });
  const data = await res.json();
  return data.places || [];
}
