export function requestLogger(
  req: {
    ip: any;
    method: any;
    originalUrl: any;
  },
  _res: any,
  next: () => void
) {
  console.log(
    `[${new Date().toISOString()}] \t ${req.ip} \t ${req.method} ${
      req.originalUrl
    }`
  );
  next();
}
