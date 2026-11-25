import Image from "next/image";

// Brand artwork is decorative and never represents an individual family member.
export function FamilyIllustration() {
  return <div className="family-illustration" aria-hidden="true">
    {(["man", "woman", "child"] as const).map((character) => <Image key={character}
      src={`/family/${character}.webp`} alt="" width={800} height={character === "child" ? 1038 : 1391}
      sizes="(max-width: 760px) 30vw, (max-width: 1150px) 16vw, 200px" />)}
  </div>;
}
