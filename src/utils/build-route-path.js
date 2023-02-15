export function buildRoutePath(path) {
  const routeParamsRegex = /:([a-zA-Z]+)/g

  const pathWithRouteParams = path.replaceAll(routeParamsRegex, '(?<$1>[a-zA-Z0-9\-_]+)')

  return new RegExp(`^${pathWithRouteParams}(?<query>\\?(.*))?$`)
}