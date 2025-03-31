DATE="2025-03-31T10:30:00"
commit_with_message() {
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" git commit -m "$1"
}

commit_with_message "removed node_modules"