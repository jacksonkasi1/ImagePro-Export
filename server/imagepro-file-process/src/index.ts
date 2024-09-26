// import 'tsconfig-paths/register';

import app from './app';

const PORT = process.env.PORT || 7860;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
