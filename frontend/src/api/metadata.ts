import axios from "axios";

export async function fetchSKUs() {
  const res = await axios.get("/api/metadata/skus");
  return res.data.skus;
}
