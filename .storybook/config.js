import { configure } from '@kadira/storybook';


const req = require.context('../src/', true, /Story\.js$/);

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module);