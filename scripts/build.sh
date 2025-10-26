set -euo pipefail

echo "Building project..."

watch=""

if [ "${1:-}" = "--watch" ]; then
  watch="--watch=forever"
fi

files=$(ls client)

for file in $files; do
  name=${file%.ts}
  echo "building client/$name.ts ..."
  npx esbuild client/$name.ts --bundle --outfile=dist/client/$name.js $watch &
done