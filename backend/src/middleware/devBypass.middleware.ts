export function devBypassAuth(req: any, _res: any, next: any) {
  console.log("DEV-BYPASS middleware running. NODE_ENV:", process.env.NODE_ENV, "IS_OFFLINE:", process.env.IS_OFFLINE);
  const isLocal = process.env.IS_OFFLINE === "true" || process.env.NODE_ENV === "development";

  if (isLocal) {
    req.user = {
      id: "DEV-ADMIN",
      role: "ADMIN",
      warehouseId: "WH-TOR-01",
    };
    console.log("DEV-BYPASS injected user:", req.user);
  }

  next();
}
