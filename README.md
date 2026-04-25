# Hold My Beverage, Dear

Are you about to do something epic, possibly ill-advised, and need a witness?
Well, `hmbd` is here for you.

Just like your friend that's tried to talk you out of it, but you're going to go
ahead and do it anyway -- `hmbd` will stand aside, close its eyes, and be there
for the time you did that thing that you really wanted to do. `hmbd` doesn't
judge, it just witnesses your actions in their full glory.

Proving that you jumped a motorbike over a chasm last Monday? Establishing a
date for your last will and testament? Or just rotating a public cryptographic
key in your decentralized identifier document? Like a hopelessly loyal friend,
`hmbd` has your back, no matter what you do.

Be glorious.

## What is `hmbd`, really?

`hmbd` is a blind witnessing service. You send it a cryptographic hash of some
data, and it digitally signs that it saw that cryptographic hash at a particular
point in time.

Blind witnesses are privacy-respecting way to prove that something happened at a
certain point in time without revealing the details of the event. Blind witness
proofs, which are digital signatures over a cryptographic hash, are used by
systems that need to time-order a series of events. These proofs demonstrate to
a verifier that the events happened in a particular order without the verifier
having to trust you to prove the order. There can be many blind witnesses per
event.

For example, to prove the edit history of a document, you could blind-witness
its cryptographic hash after each change. A verifier reviewing a document change
event just needs to trust at least one witness per change to verify the
document's contents at that point in time. More witnesses means higher
confidence. This is also useful for things like tracking the ownership history
of a property like a car or a home. It can also be used to track the change
history of something like a decentralized identifier document.
its cryptographic hash after each change. A verifier reviewing a document change
event just needs to trust at least one witness per change to verify the
document's contents at that point in time. More witnesses means higher
confidence. This is also useful for things like tracking the ownership history
of a property like a car or a home. It can also be used to track the change
history of something like a decentralized identifier document.

# Alternate Names

You are encouraged to call this service other things, like:

* Hold My Beer, Daemon
* Hold My Brewski, Dude
* Hold My Bellini, Diva
* Harbor Me Boilermaker, Dawg

... and so on; as long as it's funny.
