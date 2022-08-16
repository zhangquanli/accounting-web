// 后台接口访问地址
const getBaseURL = () => {
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:9324/api/v1';
  }
  return '/api/v1';
}

// 访问令牌
const getAuthorization = () => {
  const tokenType = localStorage.getItem("token_type");
  const accessToken = localStorage.getItem("access_token");
  if (tokenType && accessToken) {
    return `${tokenType} ${accessToken}`;
  }
  return '';
};

export { getBaseURL, getAuthorization };