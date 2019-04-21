workflow "Place holder" {
  resolves = ["Holder Flow"]
  on = "push"
}

action "Holder Flow" {
  uses = "./actions/deploy/"
}
