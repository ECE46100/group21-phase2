## Setting up
1. Install dependencies and make sure there's a .env file in /backend
```bash
npm i
```
## Some commands 
1. To schedule an autograder run:
```bash
npm run schedule
```
2. To check autograder progress:
```bash
npm run progress
```
3. To check best score:
```bash
npm run best
```
4. To check last run score:
```bash
npm run last
```
5. To run E2E test:
```bash
cd backend
npx tsc
node dist/src/server.js
cd ..
npx playwright test
```
