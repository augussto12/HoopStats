import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { provideHttpClient, withFetch } from '@angular/common/http';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, {
  providers: [provideHttpClient(withFetch())]
});


export default bootstrap;
