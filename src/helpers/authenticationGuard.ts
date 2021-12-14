export const isAuthorized = (request, response, next) => {
  console.log(request.headers.apikey);

  if (request.headers.apikey === process.env.API_KEY) {
    next();
  } else {
    response.redirect("/login");
  }
};
