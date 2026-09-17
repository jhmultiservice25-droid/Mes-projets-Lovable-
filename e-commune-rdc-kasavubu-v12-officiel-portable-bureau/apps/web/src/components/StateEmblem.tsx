import Image from "next/image";

const EMBLEM = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo_%28grey_spear%29.svg/330px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo_%28grey_spear%29.svg.png";

export function StateEmblem({ size = 52 }: { size?: number }) {
  return (
    <Image
      src={EMBLEM}
      alt="Armoiries de la République démocratique du Congo"
      width={size}
      height={size}
      className="state-emblem"
      unoptimized
      priority
    />
  );
}
