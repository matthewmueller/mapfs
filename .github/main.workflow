workflow "Continuous" {
  on = "push"
  resolves = "continuous"
}

action "continuous" {
  uses = "docker://mattmueller/continuous:node-modules-latest"
  secrets = ["STASH_KEY"]
}