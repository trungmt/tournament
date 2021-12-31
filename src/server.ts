import app from './app';
import configs from './configs';

const { port } = configs;
app.listen(port, () => {
  console.log(`Server is running at port ${port}...`);
});
