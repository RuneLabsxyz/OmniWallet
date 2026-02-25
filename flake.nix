{
  description = "OmniWallet - local-first multichain wallet orchestration core";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.nodejs_22 pkgs.pnpm pkgs.git ];
          shellHook = ''
            echo "OmniWallet dev shell ready"
          '';
        };

        checks.verify = pkgs.stdenv.mkDerivation {
          name = "omniwallet-verify";
          src = ./.;
          nativeBuildInputs = [ pkgs.nodejs_22 pkgs.pnpm ];
          buildPhase = ''
            export HOME=$PWD/.tmp-home
            mkdir -p $HOME
            pnpm install --frozen-lockfile || pnpm install
            pnpm verify
          '';
          installPhase = "mkdir -p $out";
        };
      });
}
