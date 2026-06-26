import chalk from "chalk";

export function banner(): void {
  console.log(chalk.bold.cyan("\n  ⚒  Forgekit"));
  console.log(chalk.dim("  Full-stack scaffolding without lock-in\n"));
}

export function success(message: string): void {
  console.log(chalk.green("✔"), message);
}

export function info(message: string): void {
  console.log(chalk.blue("ℹ"), message);
}

export function warn(message: string): void {
  console.log(chalk.yellow("⚠"), message);
}

export function error(message: string): void {
  console.error(chalk.red("✖"), message);
}

export function dim(message: string): void {
  console.log(chalk.dim(message));
}
