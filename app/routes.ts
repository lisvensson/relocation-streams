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
    route('rapport/:reportId', './routes/Report.tsx'),
    route('rapporter', './routes/Reports.tsx'),
    route('visa-rapport/:reportId/', './routes/ReportView.tsx'),
  ]),
] satisfies RouteConfig
