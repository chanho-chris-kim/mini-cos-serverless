import axios from "axios";

export async function fetchSKUs() {
  const res = await axios.get("/api/skus");
  return res.data.skus as string[];
}
