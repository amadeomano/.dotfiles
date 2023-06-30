# Support UTF-8 encoding
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

# Load Python3 sites - automatically from the latest version
export PYTHONPATH=$(python3 -c "import site, os; print(site.USER_BASE)")
export PATH=$PATH:"$PYTHONPATH/bin"

# Support tty for gnupg
export GPG_TTY="$(tty)"

# Add sbin for Brew
export PATH="/usr/local/sbin:$PATH"

# Add JAVA_HOME
export JAVA_HOME=/Library/Java/JavaVirtualMachines/adoptopenjdk-11.jdk/Contents/Home

# Use login keychain for aws-vault
export AWS_VAULT_KEYCHAIN_NAME="login"
# Use long living sessions in aws-vault
export AWS_SESSION_TTL="12h"

