#!/bin/bash

# This script searches for the closest version tag on the current branch
# and outputs it into the ./api/VERSION file if it adheres to SEMVER rules.
# Otherwise a fallback version is written to ./api/VERSION.
# The VERSION file itself is consumed by the VersionProvider from
# https://github.com/shivas/versioning-bundle.
#
# NOTE: If we would not write the fallback version to the file, the provider
# would crash instead!

# --abbrev=0 makes sure all shas of intermediate commits are stripped, so only the tag remains
# --always makes sure that the command won't fail (we receive a commit hash instead of the tag, if no tag has been found)
# --tags makes sure that lightweight tags are found as well (gitlab usually only creates lightweight tags and not annotated ones)
version="$(git describe --abbrev=0 --always --tags)"

echo "Git describe result: $version"

if [[ $version =~ ^[vV]?[\d]+\.[\d]+\.[\d]+(-[\w\d]+)*$ ]]; then
    echo "Found tag $version"
	echo $version > ./api/VERSION
else
    echo "Found commit hash $version"

	# fallback version, if no tag has been provided
	echo "0.0.0-fallback" > ./api/VERSION
fi
