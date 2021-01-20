import { qs } from './core';
import Url from './url';

export function replaceBase(doc, section){
  let base;
  const head = qs(doc, 'head');;
  let url = section.url;
  const absolute = (url.indexOf('://') > -1);

  if (!doc){
    return;
  }

  base = qs(head, 'base');

  if (!base) {
    base = doc.createElement('base');
    head.insertBefore(base, head.firstChild);
  }

  // Fix for Safari crashing if the url doesn't have an origin
  if (!absolute && window && window.location) {
    url = window.location.origin + url;
  }

  base.setAttribute('href', url);
}

export function replaceCanonical(doc, section){
  let head = qs(doc, 'head');
  let link;
  const url = section.canonical;

  if (!doc){
    return;
  }

  link = qs(head, 'link[rel=\'canonical\']');

  if (link) {
    link.setAttribute('href', url);
  } else {
    link = doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    head.appendChild(link);
  }
}

export function replaceMeta(doc, section){
  const head = qs(doc, 'head');;
  let meta;
  const id = section.idref;
  if (!doc){
    return;
  }

  meta = qs(head, 'link[property=\'dc.identifier\']');

  if (meta) {
    meta.setAttribute('content', id);
  } else {
    meta = doc.createElement('meta');
    meta.setAttribute('name', 'dc.identifier');
    meta.setAttribute('content', id);
    head.appendChild(meta);
  }
}

// TODO: move me to Contents
export function replaceLinks(contents, fn) {

  const links = contents.querySelectorAll('a[href]');

  if (!links.length) {
    return;
  }

  const base = qs(contents.ownerDocument, 'base');
  const location = base ? base.getAttribute('href') : undefined;
  const replaceLink = function(link){
    const href = link.getAttribute('href');

    if (href.indexOf('mailto:') === 0){
      return;
    }

    const absolute = (href.indexOf('://') > -1);

    if (absolute){

      link.setAttribute('target', '_blank');

    } else {
      let linkUrl;
      try {
        linkUrl = new Url(href, location);	
      } catch (error) {
        // NOOP
      }

      link.onclick = function(){

        if (linkUrl && linkUrl.hash) {
          fn(linkUrl.Path.path + linkUrl.hash);
        } else if (linkUrl){
          fn(linkUrl.Path.path);
        } else {
          fn(href);
        }

        return false;
      };
    }
  }.bind(this);

  for (let i = 0; i < links.length; i++) {
    replaceLink(links[i]);
  }


}

export function substitute(content, urls, replacements) {
  urls.forEach(function(url, i){
    if (url && replacements[i]) {
      // Account for special characters in the file name.
      // See https://stackoverflow.com/a/6318729.
      url = url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      content = content.replace(new RegExp(url, 'g'), replacements[i]);
    }
  });
  return content;
}
