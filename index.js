var httpProxy = require("http-proxy");
var fs = require("fs");

var wcStripeHost = "wcstripe.test"; // Local store running WC Stripe.

var proxy = httpProxy.createServer({
  target: {
    host: wcStripeHost,
    port: 80,
  },
  headers: {
    "X-Original-Host": "localhost:8009",
    "X-Forwarded-Proto": "https",
    HOST: wcStripeHost,
  },
  ssl: {
    key: fs.readFileSync("./localhost.decrypted.key"), // Check https://www.section.io/engineering-education/how-to-get-ssl-https-for-localhost/ to generate these files.
    cert: fs.readFileSync("./localhost.crt"),
  },
});

proxy.on("proxyReq", function (proxyReq, req, res) {
  // This is important. Do not send the cookies to the stripe host, otherwise the default cart will be used.
  proxyReq.setHeader("Cookie", "");
});

proxy.on("proxyRes", function (proxyRes, req, res) {
  // Adds Cart-Token to allowed headers so it can be sent via CORS requests.
  proxyRes.headers["Access-Control-Allow-Headers"] =
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, access-control-request-private-network, Cart-Token";
  proxyRes.headers["Access-Control-Allow-Private-Network"] = "true"; // Allow CORS with local host
  // Adds Cart-Token so we can access its value on CORS requests.
  proxyRes.headers["Access-Control-Expose-Headers"] = "Cart-Token";
});

proxy.listen(8009);
