#!/usr/bin/env bash
set -euo pipefail

AR_REGISTRY="https://us-npm.pkg.dev/oss-exit-gate-prod/schema-dts--npm/"
GCS_MANIFEST_DIR="gs://oss-exit-gate-prod-projects-bucket/schema-dts/npm/manifests"

npx --yes google-artifactregistry-auth --repo-config=.npmrc --credential-config="$HOME/.npmrc"

npm run pkg
npm test

# Pass workspace names (e.g. schema-dts schema-dts-gen) or default to all 3 workspaces
if [[ $# -eq 0 ]]; then
  PACKAGES=("schema-dts-lib" "schema-dts-gen" "schema-dts")
else
  PACKAGES=("$@")
fi

PUBLISHED_JSON="[]"
for PKG in "${PACKAGES[@]}"; do
  PKG_DIR="packages/${PKG}"
  VERSION="$(jq -r .version "${PKG_DIR}/package.json")"
  echo "Staging ${PKG}@${VERSION} to Artifact Registry..."
  npm publish --workspace="${PKG}" --registry="${AR_REGISTRY}"
  PUBLISHED_JSON="$(echo "${PUBLISHED_JSON}" | jq --arg name "${PKG}" --arg ver "${VERSION}" '. + [{"name": $name, "version": $ver}]')"
done

MANIFEST_FILE="$(mktemp)"
jq -n --argjson pkgs "${PUBLISHED_JSON}" '{
  publish_all: false,
  publishing_groups: [
    {
      packages: $pkgs
    }
  ]
}' > "${MANIFEST_FILE}"

gcloud storage cp "${MANIFEST_FILE}" \
  "${GCS_MANIFEST_DIR}/manifest-$(date +%s).json"
rm -f "${MANIFEST_FILE}"
