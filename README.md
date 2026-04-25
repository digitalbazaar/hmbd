# Hold My Beverage, Dear

Are you about to do something epic, possibly ill advised, and need a witness?
Well, `hmbd` is here for you.

Just like your friend that's tried to talk you out of it, but you're going to go
ahead and do it anyway -- `hmbd` will stand aside, close it's eyes, and be there
for the time you did that thing that you really wanted to do. `hmbd` doesn't
judge, it just witnesses your actions in their full glory.

Proving that you jumped a motorbike over a chasm last Monday? Establishing a
date for your last will and testament? Or just rotating a public cryptographic
key in your decentralized identifier document? Like your friend that your
parents never really liked, `hmbd` has you covered.

## What is `hmbd`, really?

`hmbd` is a blind witnessing service. You send it a cryptographic hash of some
data, and it digitally signs that it saw that cryptographic hash at a particular
point in time.

Blind witnesses are privacy-respecting way to prove that something happened at a
certain point in time without revealing the details of the event. Blind witness
proofs, which are digital signatures over a cryptographic hash, are used by
systems that need to time-order a series of events. These proofs demonstrate to
a 3rd party that the events happened in a particular order without the 3rd party
having to trust the entity trying to prove the order.

For example, to prove the edit history of a document, you could blind-witness
its cryptographic hash after each change. Anyone reviewing that log just needs
to trust at least one witness per change to verify the document's contents at
that point in time. More witnesses means higher confidence. This is useful for
things like tracking the ownership history of a property like a car or a home.
It can also be used to track the change history of something like a
decentralized identifier document.

# Alternate Names

You are encouraged to call this service other things, like:

* Hold My Beer, Daemon
* Hold My Brewski, Dude
* Hold My Bellini, Diva
* Harbor Me Boilermaker, Dawg

... and so on; as long as it's funny.
