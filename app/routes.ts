import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  route('signin', './routes/SignIn.tsx'),
  route('signin/otp', './routes/SignInOtp.tsx'),
  route('api/auth/*', 'routes/auth.ts'),
  layout('./routes/shell.tsx', [
    index('routes/home.tsx'),
    route('relocations', './routes/Relocations.tsx'),
    route('testchart', './routes/TestChart.tsx'),
    route('skapa-rapport', './routes/CreateReport.tsx'),
  ]),
] satisfies RouteConfig
